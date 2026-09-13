import { AIProvider } from './AIProvider';
import { AIRequest, AIResponse, AIContext, AIOperationType, IntentLLMOutput, CustomerResponseLLMOutput } from '../types/AITypes';
import { PromptInjectionDetector } from '../guardrails/PromptInjectionDetector';

export class FakeAIProvider implements AIProvider {
  public readonly providerName = 'fake-ai-provider';
  public readonly modelName = 'fake-gpt-4o-deterministic';

  public simulateTimeout: boolean = false;
  public simulateFailure: boolean = false;
  public simulateInvalidJson: boolean = false;
  public simulateLowConfidence: boolean = false;
  public customIntentResponse?: IntentLLMOutput;

  public reset(): void {
    this.simulateTimeout = false;
    this.simulateFailure = false;
    this.simulateInvalidJson = false;
    this.simulateLowConfidence = false;
    this.customIntentResponse = undefined;
  }

  async generate<T = Record<string, unknown>>(
    request: AIRequest<unknown>,
    context: AIContext
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();

    if (this.simulateTimeout) {
      return {
        success: false,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        error: { code: 'AI_TIMEOUT', message: 'Simulated AI provider timeout', retryable: true },
        timestamp: new Date().toISOString()
      };
    }

    if (this.simulateFailure) {
      return {
        success: false,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        error: { code: 'AI_PROVIDER_ERROR', message: 'Simulated AI service error', retryable: true },
        timestamp: new Date().toISOString()
      };
    }

    // 1. Guardrail Check: Prompt Injection Detection
    const injectionCheck = PromptInjectionDetector.detect(request.userMessage);
    if (injectionCheck.detected) {
      return {
        success: false,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        injectionDetected: true,
        injectionReason: injectionCheck.reason,
        error: { code: 'PROMPT_INJECTION_DETECTED', message: injectionCheck.reason || 'Prompt injection detected', retryable: false },
        timestamp: new Date().toISOString()
      };
    }

    if (this.simulateInvalidJson) {
      return {
        success: true,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        rawOutput: '{ invalid json structure ...',
        data: undefined,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        error: { code: 'INVALID_JSON', message: 'Malformed JSON from AI model', retryable: true },
        timestamp: new Date().toISOString()
      };
    }

    // 2. Generate Deterministic Structured Response based on Operation Type
    let resultData: unknown = {};
    let confidence = 0.95;

    if (request.operationType === AIOperationType.INTENT_CLASSIFICATION) {
      if (this.customIntentResponse) {
        resultData = this.customIntentResponse;
        confidence = this.customIntentResponse.confidence;
      } else {
        resultData = this.classifyIntentDeterministically(request.userMessage, context);
        if (this.simulateLowConfidence) {
          (resultData as IntentLLMOutput).confidence = 0.35;
          (resultData as IntentLLMOutput).ambiguity = true;
          confidence = 0.35;
        }
      }
    } else if (request.operationType === AIOperationType.CUSTOMER_RESPONSE_DRAFT) {
      resultData = {
        message: `Thank you for contacting support. We have received your inquiry regarding order ${context.orderId || 'your order'} and are processing your request safely.`,
        tone: 'EMPATHETIC',
        claims: ['Inquiry received', 'Request under review'],
        requiresClarification: false
      } as CustomerResponseLLMOutput;
    } else {
      resultData = {
        facts: [`User message analyzed: "${request.userMessage.substring(0, 30)}..."`],
        missingInformation: [],
        contradictions: [],
        suggestedQueries: ['getOrder']
      };
    }

    return {
      success: true,
      provider: this.providerName,
      model: this.modelName,
      modelVersion: 'v1.0.0',
      promptVersion: request.promptVersion,
      data: resultData as T,
      rawOutput: JSON.stringify(resultData),
      confidence,
      tokenUsage: { promptTokens: 120, completionTokens: 45, totalTokens: 165, estimatedCostUsd: 0.0003 },
      latencyMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  private classifyIntentDeterministically(userMessage: string, context: AIContext): IntentLLMOutput {
    const text = userMessage.toLowerCase();

    // Extract Order ID (e.g. ord-phone-24999 or ord-refund-4999 or ord-1001)
    let orderId: string | undefined = context.orderId;
    const stopWords = new Set(['has', 'is', 'was', 'my', 'for', 'with', 'about', 'status', 'details', 'number', 'id', 'problem', 'issue', 'a', 'the']);
    const orderMatch = userMessage.match(/\b(ord-[a-z0-9-]+)\b/i) || userMessage.match(/order\s*#\s*([a-z0-9-]+)/i) || userMessage.match(/order\s+([a-z0-9-]+)/i);
    if (orderMatch && !stopWords.has(orderMatch[1].toLowerCase())) {
      orderId = orderMatch[1];
    }

    // Extract Amount (e.g. ₹24,999 or Rs 24999)
    let amount: number | undefined;
    const rupeeMatch = userMessage.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
    if (rupeeMatch) {
      amount = parseFloat(rupeeMatch[1].replace(/,/g, ''));
    }

    let intent: IntentLLMOutput['intent'] = 'GENERAL_SUPPORT';
    let reasoning = 'General customer inquiry';
    let confidence = 0.95;

    if (text.includes('coupon') || text.includes('discount')) {
      intent = 'COUPON';
      reasoning = 'Customer requested coupon compensation';
    } else if (text.includes('cancel') || text.includes('stop order')) {
      intent = 'CANCELLATION';
      reasoning = 'Customer requested order cancellation';
    } else if (text.includes('damage') || text.includes('cracked') || text.includes('broken')) {
      intent = 'DAMAGED_ITEM';
      reasoning = 'Customer reported damaged item';
    } else if (text.includes('defective') || text.includes('faulty') || text.includes('not working')) {
      intent = 'DEFECTIVE_ITEM';
      reasoning = 'Customer reported defective item';
    } else if (text.includes('wrong item') || text.includes('wrong product') || text.includes('wrong color')) {
      intent = 'WRONG_ITEM';
      reasoning = 'Customer reported wrong item delivered';
    } else if (text.includes('late delivery') || text.includes('delay') || text.includes('late') || text.includes('arrived') || text.includes('where is my')) {
      intent = 'LATE_DELIVERY';
      reasoning = 'Customer reported late delivery';
    } else if (text.includes('missing') || text.includes('empty box')) {
      intent = 'MISSING_ITEM';
      reasoning = 'Customer reported missing item';
    } else if (text.includes('refund') || text.includes('money back')) {
      intent = 'REFUND';
      reasoning = 'Customer requested a refund';
    } else if (text.includes('replace') || text.includes('replacement')) {
      intent = 'REPLACEMENT';
      reasoning = 'Customer requested a replacement item';
    } else if (text.includes('asdf') || text.includes('qwerty') || text.includes('12345') || !/[a-z]{3,}/i.test(text)) {
      intent = 'UNKNOWN';
      confidence = 0.2;
      reasoning = 'Unrecognized customer message';
    } else {
      confidence = 0.75;
    }

    return {
      intent,
      confidence,
      entities: {
        orderId,
        customerId: context.customerId,
        amount,
        currency: amount ? 'INR' : undefined,
        reason: reasoning
      },
      missingInformation: intent === 'GENERAL_SUPPORT' || intent === 'UNKNOWN' ? ['orderId', 'issue_clarification', 'specific_issue_details'] : [],
      ambiguity: confidence < 0.8,
      reasoning
    };
  }
}
