import { AIProvider } from './AIProvider';
import { AIRequest, AIResponse, AIContext } from '../types/AITypes';
import { HardenedHttpClient } from '../../integrations/core/HttpClient';
import { PromptInjectionDetector } from '../guardrails/PromptInjectionDetector';
import { Redactor } from '../guardrails/Redactor';

export class LocalLLMProvider implements AIProvider {
  public readonly providerName = 'local-llm';
  public readonly modelName: string;
  private readonly baseURL: string;
  private readonly client: HardenedHttpClient;

  constructor(options?: { modelName?: string; baseURL?: string; customFetch?: typeof fetch }) {
    this.baseURL = options?.baseURL || process.env.LOCAL_LLM_URL || process.env.OLLAMA_URL || 'http://127.0.0.1:11434/v1';
    this.modelName = options?.modelName || process.env.LOCAL_LLM_MODEL || process.env.OLLAMA_MODEL || 'llama3.2:latest';
    
    // Hardened client with 30s timeout and single retry for local inferencing
    this.client = new HardenedHttpClient({
      baseURL: this.baseURL,
      timeoutMs: Number(process.env.LOCAL_LLM_TIMEOUT_MS) || 30000,
      maxRetries: 1,
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

    // 2. Data Minimization & Context Redaction
    const sanitizedContext = Redactor.redactObject(request.contextData || {});
    const sanitizedUserMessage = Redactor.redactString(request.userMessage);

    const payload = {
      model: this.modelName,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: `${request.systemPrompt}\n\nContext facts:\n${JSON.stringify(sanitizedContext)}\nReturn valid JSON matching requested output format.` },
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
          'Content-Type': 'application/json'
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
          error: { code: 'INVALID_JSON_OUTPUT', message: `Local LLM returned invalid JSON: ${err.message}`, retryable: true },
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
          estimatedCostUsd: 0.0 // 100% Free local execution
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
          code: (err.code === 'NETWORK_ERROR' || !err.code || typeof err.code !== 'string') ? 'LOCAL_LLM_UNAVAILABLE' : err.code,
          message: `Local LLM Endpoint unreachable at ${this.baseURL}: ${err.message || String(err)}`,
          retryable: true
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}
