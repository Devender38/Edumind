export interface InjectionCheckResult {
  detected: boolean;
  score: number; // 0.0 to 1.0
  matchedPatterns: string[];
  reason?: string;
}

export class PromptInjectionDetector {
  private static INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
    /disregard\s+(all\s+)?(previous|prior)\s+directions/i,
    /you\s+are\s+now\s+(an?\s+)?(admin|system|operator|developer|root|god\s+mode)/i,
    /override\s+(all\s+)?(policy|policies|safety|security|rules)/i,
    /system\s*:\s*\[?override/i,
    /system\s+override/i,
    /execute_tool\s*\(/i,
    /executeTool\s*\(/i,
    /call_tool\s*\(/i,
    /callTool\s*\(/i,
    /tool_call\s*\(/i,
    /toolCall\s*\(/i,
    /issue_refund\s*\(/i,
    /issueRefund\s*\(/i,
    /cancel_order\s*\(/i,
    /cancelOrder\s*\(/i,
    /bypass\s+(approval|consent|policy|auth)/i,
    /reveal\s+(system\s+prompt|secret|api\s+key|credentials|password)/i,
    /show\s+me\s+your\s+(instructions|prompt|secret)/i,
    /print\s+(system\s+prompt|chain\s+of\s+thought)/i,
    /(output|dump|print|show|return)\s+(system\s+prompt|all\s+instructions|secret|environment)/i,
    /OPENAI_API_KEY/,
    /RESOLVEX_AUTH_SECRET/,
    /approvalToken\s*=\s*['"]?[a-z0-9_-]+/i,
    /fake_approval_token/i,
    /\[SYSTEM_NOTE\]/i,
    /<SYSTEM_INSTRUCTION>/i
  ];

  public static detect(input: string): InjectionCheckResult {
    if (!input || typeof input !== 'string') {
      return { detected: false, score: 0, matchedPatterns: [] };
    }

    const matchedPatterns: string[] = [];

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        matchedPatterns.push(pattern.source);
      }
    }

    if (matchedPatterns.length > 0) {
      const score = Math.min(1.0, matchedPatterns.length * 0.5);
      return {
        detected: true,
        score,
        matchedPatterns,
        reason: `Prompt injection risk detected matching ${matchedPatterns.length} pattern(s)`
      };
    }

    return {
      detected: false,
      score: 0,
      matchedPatterns: []
    };
  }
}
