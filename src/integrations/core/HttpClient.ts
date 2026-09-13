import { IntegrationError } from './IntegrationError';
import { redactSensitiveData } from './IntegrationContext';

export interface HttpClientOptions {
  baseURL?: string;
  timeoutMs?: number;
  maxRetries?: number;
  backoffBaseMs?: number;
  maxPayloadSizeBytes?: number;
  customFetch?: typeof fetch;
}

export interface HttpRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  idempotencyKey?: string;
  tenantId?: string;
  correlationId?: string;
  timeoutMs?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
}

export class HardenedHttpClient {
  private readonly baseURL: string;
  private readonly defaultTimeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffBaseMs: number;
  private readonly maxPayloadSizeBytes: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.defaultTimeoutMs = options.timeoutMs ?? 5000;
    this.maxRetries = options.maxRetries ?? 3;
    this.backoffBaseMs = options.backoffBaseMs ?? 200;
    this.maxPayloadSizeBytes = options.maxPayloadSizeBytes ?? 10 * 1024 * 1024; // 10MB
    this.fetchImpl = options.customFetch || globalThis.fetch;
  }

  public async request<T = unknown>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const fullUrl = this.baseURL ? `${this.baseURL.replace(/\/$/, '')}/${options.url.replace(/^\//, '')}` : options.url;
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {})
    };

    if (options.tenantId) {
      headers['X-Tenant-ID'] = options.tenantId;
    }
    if (options.correlationId) {
      headers['X-Correlation-ID'] = options.correlationId;
    }
    if (options.idempotencyKey) {
      headers['X-Idempotency-Key'] = options.idempotencyKey;
    }

    let serializedBody: string | undefined = undefined;
    if (options.body !== undefined) {
      serializedBody = JSON.stringify(options.body);
      if (Buffer.byteLength(serializedBody, 'utf8') > this.maxPayloadSizeBytes) {
        throw new IntegrationError({
          message: `Payload size exceeds maximum allowed limit of ${this.maxPayloadSizeBytes} bytes`,
          code: 'PAYLOAD_TOO_LARGE',
          retryable: false
        });
      }
    }

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;
      try {
        const response = await this.executeWithTimeout(fullUrl, {
          method: options.method,
          headers,
          body: serializedBody
        }, timeoutMs);

        const responseText = await response.text();
        let parsedData: unknown;
        try {
          parsedData = responseText ? JSON.parse(responseText) : {};
        } catch {
          parsedData = responseText;
        }

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          responseHeaders[key.toLowerCase()] = val;
        });

        if (!response.ok) {
          const error = IntegrationError.fromHttpStatus(
            response.status,
            `HTTP ${response.status} ${response.statusText}`,
            responseText
          );
          lastError = error;

          if (error.retryable && attempt <= this.maxRetries) {
            const backoff = this.calculateBackoff(attempt);
            await new Promise(res => setTimeout(res, backoff));
            continue;
          }

          throw error;
        }

        return {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          data: parsedData as T
        };

      } catch (err: any) {
        lastError = err;

        if (err instanceof IntegrationError || err?.name === 'IntegrationError' || err?.code?.startsWith('INTEGRATION_')) {
          if (err.retryable && attempt <= this.maxRetries) {
            const backoff = this.calculateBackoff(attempt);
            await new Promise(res => setTimeout(res, backoff));
            continue;
          }
          throw err;
        }

        if (err.name === 'AbortError' || err.message?.includes('timeout')) {
          const timeoutError = new IntegrationError({
            message: `Request timed out after ${timeoutMs}ms`,
            code: 'INTEGRATION_TIMEOUT',
            retryable: true,
            isTimeout: true,
            isUnknownOutcome: true,
            cause: err
          });

          if (attempt <= this.maxRetries) {
            const backoff = this.calculateBackoff(attempt);
            await new Promise(res => setTimeout(res, backoff));
            continue;
          }
          throw timeoutError;
        }

        // Network error
        const netError = new IntegrationError({
          message: `Network error connecting to ${fullUrl}: ${err.message}`,
          code: 'NETWORK_ERROR',
          retryable: true,
          isUnknownOutcome: true,
          cause: err
        });

        if (attempt <= this.maxRetries) {
          const backoff = this.calculateBackoff(attempt);
          await new Promise(res => setTimeout(res, backoff));
          continue;
        }
        throw netError;
      }
    }

    throw lastError || new Error(`Request failed after ${this.maxRetries} retries`);
  }

  private async executeWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      if (!this.fetchImpl) {
        throw new Error('No fetch implementation available');
      }
      const res = await this.fetchImpl(url, { ...init, signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  private calculateBackoff(attempt: number): number {
    const exponential = Math.pow(2, attempt - 1) * this.backoffBaseMs;
    const jitter = Math.random() * 50;
    return Math.min(exponential + jitter, 5000);
  }
}
