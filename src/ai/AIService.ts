import { AIRequest, AIResponse, AIContext, AIOperationType, IntentLLMOutput, CustomerResponseLLMOutput } from './types/AITypes';
import { AIProviderRegistry } from './providers/AIProviderRegistry';
import { PromptRegistry } from './prompts/PromptRegistry';
import { OutputValidator } from './guardrails/OutputValidator';
import { PromptInjectionDetector } from './guardrails/PromptInjectionDetector';
import { Redactor } from './guardrails/Redactor';
import { Logger } from '../utils/logger';
import { metrics } from '../observability/metrics';

export class AIService {
  private static runAiCallCounts: Map<string, number> = new Map();
  private static readonly DEFAULT_MAX_AI_CALLS_PER_RUN = Number(process.env.MAX_AI_CALLS_PER_RUN) || 5;

  /**
   * Resets AI call count tracker for testing or new runs
   */
  public static resetCallCounts(): void {
    this.runAiCallCounts.clear();
  }

  /**
   * Main entry point for AI Intent Classification.
   * Performs injection check -> calls active AI Provider -> validates schema & entity ground-truth -> returns validated IntentLLMOutput.
   */
  public static async classifyIntent(
    userMessage: string,
    context: AIContext
  ): Promise<AIResponse<IntentLLMOutput>> {
    const startTime = Date.now();
    const promptDef = PromptRegistry.getPrompt(AIOperationType.INTENT_CLASSIFICATION);

    // 1. Check AI Call Count Bounding per AgentRun
    if (context.agentRunId) {
      const currentCalls = (this.runAiCallCounts.get(context.agentRunId) || 0) + 1;
      const maxCalls = context.maxCallsPerRun || this.DEFAULT_MAX_AI_CALLS_PER_RUN;
      if (currentCalls > maxCalls) {
        Logger.warn({
          event: 'AI_COST_LIMIT_EXCEEDED',
          agentRunId: context.agentRunId,
          correlationId: context.correlationId,
          message: `AI call limit exceeded (${currentCalls}/${maxCalls}). Falling back to deterministic processing.`
        });
        return {
          success: false,
          provider: 'system',
          model: 'none',
          promptVersion: promptDef.version,
          confidence: 0,
          latencyMs: Date.now() - startTime,
          error: { code: 'MAX_AI_CALLS_EXCEEDED', message: `AI call limit exceeded (${currentCalls}/${maxCalls})`, retryable: false },
          timestamp: new Date().toISOString()
        };
      }
      this.runAiCallCounts.set(context.agentRunId, currentCalls);
    }

    // 2. Guardrail Check: Prompt Injection Defense
    const injectionCheck = PromptInjectionDetector.detect(userMessage);
    if (injectionCheck.detected) {
      Logger.warn({
        event: 'AI_PROMPT_INJECTION_DETECTED',
        agentRunId: context.agentRunId,
        correlationId: context.correlationId,
        message: injectionCheck.reason,
        metadata: { matchedPatterns: injectionCheck.matchedPatterns }
      });
      metrics.integrationOperationsTotal.inc({ provider: 'ai-guardrail', operation: 'injection_check', outcome: 'BLOCKED' });

      return {
        success: false,
        provider: 'guardrail',
        model: 'none',
        promptVersion: promptDef.version,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        injectionDetected: true,
        injectionReason: injectionCheck.reason,
        error: { code: 'PROMPT_INJECTION_DETECTED', message: injectionCheck.reason || 'Prompt injection detected', retryable: false },
        timestamp: new Date().toISOString()
      };
    }

    // 3. Construct Data-Minimized Request
    const request: AIRequest = {
      operationType: AIOperationType.INTENT_CLASSIFICATION,
      promptVersion: promptDef.version,
      systemPrompt: promptDef.systemPrompt,
      userMessage: Redactor.redactString(userMessage),
      contextData: Redactor.redactObject({
        tenantId: context.tenantId,
        orderId: context.orderId,
        ticketId: context.ticketId
      }),
      expectedSchemaName: 'IntentLLMOutput'
    };

    Logger.info({
      event: 'AI_REQUESTED',
      agentRunId: context.agentRunId,
      correlationId: context.correlationId,
      message: `Requesting AI Intent Classification using prompt ${promptDef.version}`
    });

    // 4. Dispatch to Active AI Provider
    const provider = AIProviderRegistry.getInstance().getActiveProvider();
    const providerRes = await provider.generate<IntentLLMOutput>(request, context);

    if (!providerRes.success || !providerRes.data) {
      Logger.warn({
        event: 'AI_FAILED',
        agentRunId: context.agentRunId,
        correlationId: context.correlationId,
        message: providerRes.error?.message || 'AI Provider execution failed'
      });
      return providerRes;
    }

    // 5. Output Validation & Ground-Truth Entity Verification
    const validation = await OutputValidator.validateAndVerifyIntent(providerRes.data, context.tenantId);

    if (!validation.valid || !validation.data) {
      Logger.warn({
        event: 'AI_INVALID_OUTPUT',
        agentRunId: context.agentRunId,
        correlationId: context.correlationId,
        message: `AI output validation failed: ${validation.errors.join('; ')}`
      });
      return {
        ...providerRes,
        success: false,
        error: { code: 'SCHEMA_VALIDATION_FAILED', message: validation.errors.join('; '), retryable: false }
      };
    }

    const validatedData = validation.data;

    // Check low confidence threshold
    const confidenceThreshold = Number(process.env.AI_CONFIDENCE_THRESHOLD) || 0.7;
    if (validatedData.confidence < confidenceThreshold) {
      Logger.warn({
        event: 'AI_LOW_CONFIDENCE',
        agentRunId: context.agentRunId,
        correlationId: context.correlationId,
        message: `AI intent confidence (${(validatedData.confidence * 100).toFixed(0)}%) is below threshold (${(confidenceThreshold * 100).toFixed(0)}%)`
      });
    }

    Logger.info({
      event: 'AI_COMPLETED',
      agentRunId: context.agentRunId,
      correlationId: context.correlationId,
      message: `AI Intent classified: ${validatedData.intent} (Confidence: ${(validatedData.confidence * 100).toFixed(0)}%)`
    });

    return {
      ...providerRes,
      data: validatedData
    };
  }

  /**
   * Main entry point for Customer Response Drafting with safety validation.
   */
  public static async draftCustomerResponse(
    userMessage: string,
    verifiedStatus: string,
    context: AIContext
  ): Promise<AIResponse<CustomerResponseLLMOutput>> {
    const startTime = Date.now();
    const promptDef = PromptRegistry.getPrompt(AIOperationType.CUSTOMER_RESPONSE_DRAFT);

    const injectionCheck = PromptInjectionDetector.detect(userMessage);
    if (injectionCheck.detected) {
      return {
        success: false,
        provider: 'guardrail',
        model: 'none',
        promptVersion: promptDef.version,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        injectionDetected: true,
        injectionReason: injectionCheck.reason,
        error: { code: 'PROMPT_INJECTION_DETECTED', message: injectionCheck.reason || 'Prompt injection detected', retryable: false },
        timestamp: new Date().toISOString()
      };
    }

    const request: AIRequest = {
      operationType: AIOperationType.CUSTOMER_RESPONSE_DRAFT,
      promptVersion: promptDef.version,
      systemPrompt: promptDef.systemPrompt,
      userMessage: Redactor.redactString(userMessage),
      contextData: Redactor.redactObject({
        verifiedStatus,
        orderId: context.orderId
      }),
      expectedSchemaName: 'CustomerResponseLLMOutput'
    };

    const provider = AIProviderRegistry.getInstance().getActiveProvider();
    const providerRes = await provider.generate<CustomerResponseLLMOutput>(request, context);

    if (!providerRes.success || !providerRes.data) {
      return providerRes;
    }

    // Safety validation of customer response draft
    const validation = OutputValidator.validateCustomerResponse(providerRes.data, verifiedStatus);
    if (!validation.valid || !validation.data) {
      Logger.warn({
        event: 'AI_SAFETY_REJECTED',
        agentRunId: context.agentRunId,
        correlationId: context.correlationId,
        message: `Customer response draft rejected by safety guardrail: ${validation.errors.join('; ')}`
      });
      return {
        ...providerRes,
        success: false,
        error: { code: 'RESPONSE_SAFETY_REJECTION', message: validation.errors.join('; '), retryable: false }
      };
    }

    return {
      ...providerRes,
      data: validation.data
    };
  }
}
