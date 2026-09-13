// ResolveX Production SSRF Guard — Step 5
// Inspects outbound HTTP URLs to block internal network access, cloud metadata endpoints, and localhost abuse.

export interface SSRFCheckResult {
  allowed: boolean;
  reason?: string;
  url: string;
}

export class SSRFGuard {
  private static PRIVATE_IP_RANGES = [
    /^127\./,                         // Loopback 127.0.0.0/8
    /^10\./,                          // RFC1918 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // RFC1918 172.16.0.0/12
    /^192\.168\./,                    // RFC1918 192.168.0.0/16
    /^169\.254\./,                    // Link-local / Cloud Metadata 169.254.0.0/16
    /^0\./,                           // Current network 0.0.0.0/8
    /^::1$/,                          // IPv6 Loopback
    /^fc00:/,                         // IPv6 Unique Local
    /^fe80:/                          // IPv6 Link-local
  ];

  private static BLOCKED_HOSTNAMES = [
    'localhost',
    'metadata.google.internal',
    '169.254.169.254',
    'instance-data',
    'metadata'
  ];

  /**
   * Evaluates an outbound URL against SSRF safety policies.
   */
  public static isUrlAllowed(rawUrl: string, options?: { allowLocalhost?: boolean }): SSRFCheckResult {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { allowed: false, reason: 'URL string is missing or invalid type', url: String(rawUrl) };
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return { allowed: false, reason: 'Malformed URL format', url: rawUrl };
    }

    // Protocol check: Allow http and https only
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { allowed: false, reason: `Disallowed protocol '${parsed.protocol}'. Only http: and https: are allowed`, url: rawUrl };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check explicit localhost override flag for local LLM sandbox development
    const isLocalhostRequest = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    if (isLocalhostRequest && options?.allowLocalhost) {
      return { allowed: true, url: rawUrl };
    }

    // Check blocked hostnames
    if (this.BLOCKED_HOSTNAMES.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
      return { allowed: false, reason: `Blocked internal hostname or metadata endpoint '${hostname}'`, url: rawUrl };
    }

    // Check internal host suffixes
    if (hostname.endsWith('.internal') || hostname.endsWith('.local') || hostname.endsWith('.lan')) {
      return { allowed: false, reason: `Blocked internal domain suffix in '${hostname}'`, url: rawUrl };
    }

    // Check private IP regex patterns
    for (const pattern of this.PRIVATE_IP_RANGES) {
      if (pattern.test(hostname)) {
        return { allowed: false, reason: `Blocked private or restricted IP range in '${hostname}'`, url: rawUrl };
      }
    }

    return { allowed: true, url: rawUrl };
  }
}
