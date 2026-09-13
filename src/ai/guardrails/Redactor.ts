export class Redactor {
  private static SENSITIVE_KEYS = [
    'password',
    'secret',
    'apikey',
    'api_key',
    'token',
    'authorization',
    'bearer',
    'creditcard',
    'cardnumber',
    'cvv',
    'ssn',
    'database_url',
    'database_url_pg',
    'dburl',
    'db_url',
    'postgres',
    'connectionstring',
    'chainofthought',
    'chain_of_thought',
    'hmac',
    'dbpassword'
  ];

  /**
   * Recursively redacts sensitive fields from objects or JSON structures.
   */
  public static redactObject<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item)) as unknown as T;
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (this.SENSITIVE_KEYS.some(s => lowerKey.includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.redactObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized as T;
  }

  /**
   * Redacts sensitive string patterns like API keys, credit cards, SSNs, or passwords embedded in prose.
   */
  public static redactString(text: string): string {
    if (!text || typeof text !== 'string') return text;

    let result = text;

    // Redact bearer tokens
    result = result.replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]');

    // Redact postgresql connection URLs
    result = result.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgresql://[REDACTED_DB_URL]');

    // Redact credit card numbers (e.g. 4111-2222-3333-4444)
    result = result.replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CREDIT_CARD]');

    // Redact SSNs (e.g. 999-00-1111)
    result = result.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]');

    // Redact passwords in prose like "password is secretpass123" or "password: mypass"
    result = result.replace(/(password\s*(?:is|:|=)?\s*)([^\s,."']+)/gi, '$1[REDACTED]');

    // Redact API key strings
    result = result.replace(/(?:api[_-]?key|secret|token)\s*=\s*['"]?[a-zA-Z0-9_-]{8,}['"]?/gi, 'apiKey=[REDACTED]');
    result = result.replace(/\bsk-(?:proj-)?[a-zA-Z0-9_-]{10,}\b/g, '[REDACTED_API_KEY]');

    return result;
  }
}
