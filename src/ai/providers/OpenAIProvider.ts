import { AIProvider } from './AIProvider';
import { AIRequest, AIResponse, AIContext } from '../types/AITypes';
import { HardenedHttpClient } from '../../integrations/core/HttpClient';
import { PromptInjectionDetector } from '../guardrails/PromptInjectionDetector';
import { Redactor } from '../guardrails/Redactor';

export class OpenAIProvider implements AIProvider {
  public readonly providerName = 'openai';
  public readonly modelName: string;
  private readonly apiKey: string;
  private readonly client: HardenedHttpClient;

  constructor(options?: { apiKey?: string; modelName?: string; baseURL?: string; customFetch?: typeof fetch }) {
    this.apiKey = options?.apiKey !== undefined ? options.apiKey : (process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '');
    this.modelName = options?.modelName || process.env.AI_MODEL || process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini';
    this.client = new HardenedHttpClient({
      baseURL: options?.baseURL || process.env.AI_BASE_URL || 'https://api.openai.com/v1',
      timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 10000,
      customFetch: options?.customFetch
    });
  }

  async generate<T = Record<string, unknown>>(
    request: AIRequest<unknown>,
    context: AIContext
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();

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

    if (!this.apiKey || this.apiKey === 'sk-placeholder' || this.apiKey.trim() === '') {
      return {
        success: false,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        error: { code: 'AI_CONFIGURATION_ERROR', message: 'OPENAI_API_KEY is missing or invalid in production mode', retryable: false },
        timestamp: new Date().toISOString()
      };
    }

    // 2. Data Minimization & Context Redaction
    const sanitizedContext = Redactor.redactObject(request.contextData || {});
    const sanitizedUserMessage = Redactor.redactString(request.userMessage);

    const payload = {
      model: this.modelName,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${request.systemPrompt}\n\nContext facts:\n${JSON.stringify(sanitizedContext)}` },
        { role: 'user', content: sanitizedUserMessage }
      ],
      temperature: request.temperature ?? 0.1,
      max_tokens: request.maxTokens ?? 500
    };

    try {
      const httpRes = await this.client.request<any>({
        method: 'POST',
        url: '/chat/completions',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: payload,
        tenantId: context.tenantId,
        correlationId: context.correlationId
      });

      const choice = httpRes.data?.choices?.[0];
      const contentStr = choice?.message?.content || '{}';
      const usage = httpRes.data?.usage;

      let parsedData: T;
      try {
        parsedData = JSON.parse(contentStr) as T;
      } catch (err: any) {
        return {
          success: false,
          provider: this.providerName,
          model: this.modelName,
          promptVersion: request.promptVersion,
          rawOutput: contentStr,
          confidence: 0,
          latencyMs: Date.now() - startTime,
          error: { code: 'INVALID_JSON_OUTPUT', message: `OpenAI returned invalid JSON: ${err.message}`, retryable: true },
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        provider: this.providerName,
        model: this.modelName,
        modelVersion: httpRes.data?.model || this.modelName,
        promptVersion: request.promptVersion,
        data: parsedData,
        rawOutput: contentStr,
        confidence: (parsedData as any)?.confidence ?? 0.9,
        tokenUsage: usage ? {
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          estimatedCostUsd: (usage.prompt_tokens * 0.00000015) + (usage.completion_tokens * 0.0000006)
        } : undefined,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (err: any) {
      return {
        success: false,
        provider: this.providerName,
        model: this.modelName,
        promptVersion: request.promptVersion,
        confidence: 0,
        latencyMs: Date.now() - startTime,
        error: {
          code: err.code || 'OPENAI_API_ERROR',
          message: err.message,
          retryable: err.retryable ?? true
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}
