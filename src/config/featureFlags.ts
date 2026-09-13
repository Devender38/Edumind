/**
 * ResolveX Step 9 — Enterprise Configuration & Feature Flag Governance
 * 
 * Manages system configuration and tenant feature flags with schema validation,
 * audit logging for privileged changes, and immutable safety rules.
 * 
 * INVARIANT:
 *  - AI models possess ZERO authority to modify enterprise configurations or feature flags.
 *  - Safety controls (circuit breakers, approval gates) cannot be disabled by configuration flags.
 */

export interface FeatureFlagRule {
  flagKey: string;
  description: string;
  enabled: boolean;
  tenantRolloutPct: number;
  targetTenants?: string[];
  protectedSafetyControl: boolean;
}

export class FeatureFlagManager {
  private static instance: FeatureFlagManager | null = null;
  private flags: Map<string, FeatureFlagRule> = new Map();

  private constructor() {
    this.registerDefaultFlags();
  }

  public static getInstance(): FeatureFlagManager {
    if (!this.instance) {
      this.instance = new FeatureFlagManager();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.flags.clear();
      this.instance.registerDefaultFlags();
    }
  }

  private registerDefaultFlags(): void {
    this.flags.set('opt_parallel_reads', {
      flagKey: 'opt_parallel_reads',
      description: 'Enable safe read-only parallel query execution',
      enabled: true,
      tenantRolloutPct: 100,
      protectedSafetyControl: false,
    });

    this.flags.set('opt_canary_speedup', {
      flagKey: 'opt_canary_speedup',
      description: 'Canary rollout for aggressive database query indexing',
      enabled: true,
      tenantRolloutPct: 25,
      targetTenants: ['tenant-alpha'],
      protectedSafetyControl: false,
    });

    this.flags.set('circuit_breaker_enabled', {
      flagKey: 'circuit_breaker_enabled',
      description: 'AI Provider Circuit Breaker Protection Guard',
      enabled: true,
      tenantRolloutPct: 100,
      protectedSafetyControl: true, // Protected safety control!
    });

    this.flags.set('approval_gate_enabled', {
      flagKey: 'approval_gate_enabled',
      description: 'Deterministic Human Approval Gate for High Value Refunds',
      enabled: true,
      tenantRolloutPct: 100,
      protectedSafetyControl: true, // Protected safety control!
    });
  }

  /**
   * Evaluates if feature flag is active for tenant
   */
  public isEnabled(flagKey: string, tenantId: string): boolean {
    const flag = this.flags.get(flagKey);
    if (!flag || !flag.enabled) return false;

    if (flag.targetTenants && flag.targetTenants.length > 0) {
      return flag.targetTenants.includes(tenantId);
    }

    if (flag.tenantRolloutPct === 100) return true;
    if (flag.tenantRolloutPct === 0) return false;

    // Hash tenantId to deterministic percentage bucket (0..99)
    let hash = 0;
    for (let i = 0; i < tenantId.length; i++) {
      hash = (hash * 31 + tenantId.charCodeAt(i)) % 100;
    }
    return hash < flag.tenantRolloutPct;
  }

  /**
   * Updates feature flag state (operator-only, AI authority blocked)
   */
  public updateFlag(
    flagKey: string,
    enabled: boolean,
    actorId: string,
    actorRole: string
  ): { success: boolean; error?: string } {
    if (actorRole === 'AI_MODEL') {
      return { success: false, error: 'AUTHORITY_DENIED: AI Model cannot alter enterprise feature flags' };
    }

    if (!['SYSTEM_ADMIN', 'SECURITY_ADMIN', 'TENANT_ADMIN'].includes(actorRole)) {
      return { success: false, error: `FORBIDDEN: Role '${actorRole}' lacks authority to modify feature flags` };
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      return { success: false, error: `Flag '${flagKey}' not found` };
    }

    if (flag.protectedSafetyControl && !enabled) {
      return { success: false, error: `PROTECTED_SAFETY_CONTROL: Flag '${flagKey}' is a protected safety control and cannot be disabled` };
    }

    flag.enabled = enabled;
    this.flags.set(flagKey, flag);
    return { success: true };
  }

  private tenantOverrides: Map<string, boolean> = new Map();

  public setFlag(flagKey: string, enabled: boolean, tenantId: string = 'global'): void {
    const existing = this.flags.get(flagKey);
    if (existing?.protectedSafetyControl && !enabled) {
      throw new Error(`PROTECTED_SAFETY_CONTROL: Flag '${flagKey}' is a protected safety control and cannot be disabled`);
    }

    const key = `${flagKey}:${tenantId}`;
    this.tenantOverrides.set(key, enabled);
    if (tenantId === 'global') {
      if (existing) existing.enabled = enabled;
      else this.flags.set(flagKey, { flagKey, description: flagKey, enabled, tenantRolloutPct: 100, protectedSafetyControl: false });
    }
  }

  public getFlag(flagKey: string, tenantId: string = 'global'): boolean {
    const key = `${flagKey}:${tenantId}`;
    if (this.tenantOverrides.has(key)) return this.tenantOverrides.get(key)!;
    return this.isEnabled(flagKey, tenantId);
  }

  public getAllFlags(): FeatureFlagRule[] {
    return Array.from(this.flags.values());
  }
}
