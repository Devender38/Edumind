/**
 * ResolveX Step 8 — Tenant-Aware Resource Fairness & Quota Manager
 * 
 * Tracks aggregate resource usage per tenant (active runs, AI calls, tokens, execution time).
 * Enforces per-tenant fairness limits (concurrency limit, token budget, rate limits).
 * Prevents noisy tenant starvation.
 */

export interface TenantResourceQuota {
  tenantId: string;
  maxActiveRuns: number;
  maxTokensPerMinute: number;
  maxCallsPerMinute: number;
}

export interface TenantUsageSnapshot {
  tenantId: string;
  activeRunsCount: number;
  tokensLastMinute: number;
  callsLastMinute: number;
  quotaExceeded: boolean;
  throttleReason?: string;
}

export class TenantFairnessManager {
  private static instance: TenantFairnessManager;

  private defaultQuotas: TenantResourceQuota = {
    tenantId: 'default',
    maxActiveRuns: 3,
    maxTokensPerMinute: 20000,
    maxCallsPerMinute: 60,
  };

  private tenantQuotas: Map<string, TenantResourceQuota> = new Map();
  private activeRunsPerTenant: Map<string, number> = new Map();
  private tenantActivityWindow: Map<string, Array<{ timestamp: number; tokens: number }>> = new Map();

  private constructor() {}

  public static getInstance(): TenantFairnessManager {
    if (!TenantFairnessManager.instance) {
      TenantFairnessManager.instance = new TenantFairnessManager();
    }
    return TenantFairnessManager.instance;
  }

  public static resetInstance(): void {
    (TenantFairnessManager as any).instance = null;
  }

  public setTenantQuota(quota: TenantResourceQuota): void {
    this.tenantQuotas.set(quota.tenantId, quota);
  }

  public getTenantQuota(tenantId: string): TenantResourceQuota {
    return this.tenantQuotas.get(tenantId) || { ...this.defaultQuotas, tenantId };
  }

  public incrementTenantActiveRuns(tenantId: string): void {
    const current = this.activeRunsPerTenant.get(tenantId) || 0;
    this.activeRunsPerTenant.set(tenantId, current + 1);
  }

  public decrementTenantActiveRuns(tenantId: string): void {
    const current = this.activeRunsPerTenant.get(tenantId) || 0;
    this.activeRunsPerTenant.set(tenantId, Math.max(0, current - 1));
  }

  public recordTenantActivity(tenantId: string, tokens: number = 0): void {
    const now = Date.now();
    const window = this.tenantActivityWindow.get(tenantId) || [];
    window.push({ timestamp: now, tokens });
    
    // Prune entries older than 1 minute
    const valid = window.filter((e) => now - e.timestamp <= 60000);
    this.tenantActivityWindow.set(tenantId, valid);
  }

  public evaluateTenantAccess(tenantId: string): TenantUsageSnapshot {
    const quota = this.getTenantQuota(tenantId);
    const activeRuns = this.activeRunsPerTenant.get(tenantId) || 0;

    const now = Date.now();
    const window = (this.tenantActivityWindow.get(tenantId) || []).filter((e) => now - e.timestamp <= 60000);
    const tokensLastMinute = window.reduce((sum, e) => sum + e.tokens, 0);
    const callsLastMinute = window.length;

    let quotaExceeded = false;
    let throttleReason: string | undefined = undefined;

    if (activeRuns >= quota.maxActiveRuns) {
      quotaExceeded = true;
      throttleReason = `Tenant concurrency quota exceeded (${activeRuns}/${quota.maxActiveRuns} active runs)`;
    } else if (tokensLastMinute >= quota.maxTokensPerMinute) {
      quotaExceeded = true;
      throttleReason = `Tenant token quota exceeded (${tokensLastMinute}/${quota.maxTokensPerMinute} tokens/min)`;
    } else if (callsLastMinute >= quota.maxCallsPerMinute) {
      quotaExceeded = true;
      throttleReason = `Tenant call rate quota exceeded (${callsLastMinute}/${quota.maxCallsPerMinute} calls/min)`;
    }

    return {
      tenantId,
      activeRunsCount: activeRuns,
      tokensLastMinute,
      callsLastMinute,
      quotaExceeded,
      throttleReason,
    };
  }

  public reset(): void {
    this.activeRunsPerTenant.clear();
    this.tenantActivityWindow.clear();
    this.tenantQuotas.clear();
  }

  // Test & API Compatibility Methods
  private tenantConfigs: Map<string, { maxConcurrentRuns: number; tokenRatePerSec: number }> = new Map();
  private tokenBuckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private rejectedRuns: Map<string, number> = new Map();

  public setTenantConfig(tenantId: string, config: { maxConcurrentRuns: number; tokenRatePerSec: number }): void {
    this.tenantConfigs.set(tenantId, config);
    this.setTenantQuota({
      tenantId,
      maxActiveRuns: config.maxConcurrentRuns,
      maxTokensPerMinute: config.tokenRatePerSec * 60,
      maxCallsPerMinute: 600
    });
  }

  public acquireRunSlot(tenantId: string): { allowed: boolean; reason?: string } {
    const config = this.tenantConfigs.get(tenantId) || { maxConcurrentRuns: 3, tokenRatePerSec: 100 };
    const current = this.activeRunsPerTenant.get(tenantId) || 0;
    if (current >= config.maxConcurrentRuns) {
      this.rejectedRuns.set(tenantId, (this.rejectedRuns.get(tenantId) || 0) + 1);
      return { allowed: false, reason: `Tenant concurrency limit reached (${current}/${config.maxConcurrentRuns})` };
    }
    this.activeRunsPerTenant.set(tenantId, current + 1);
    return { allowed: true };
  }

  public releaseRunSlot(tenantId: string): void {
    const current = this.activeRunsPerTenant.get(tenantId) || 0;
    if (current > 0) {
      this.activeRunsPerTenant.set(tenantId, current - 1);
    }
  }

  public consumeTokens(tenantId: string, count: number): { allowed: boolean; reason?: string } {
    const config = this.tenantConfigs.get(tenantId) || { maxConcurrentRuns: 10, tokenRatePerSec: 100 };
    const now = Date.now();
    let bucket = this.tokenBuckets.get(tenantId);
    if (!bucket) {
      bucket = { tokens: config.tokenRatePerSec, lastRefill: now };
    } else {
      const elapsedSec = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(config.tokenRatePerSec, bucket.tokens + elapsedSec * config.tokenRatePerSec);
      bucket.lastRefill = now;
    }

    if (bucket.tokens < count) {
      this.tokenBuckets.set(tenantId, bucket);
      return { allowed: false, reason: 'Rate limit exceeded: token bucket empty' };
    }

    bucket.tokens -= count;
    this.tokenBuckets.set(tenantId, bucket);
    return { allowed: true };
  }

  public getTenantStats(tenantId: string): { activeRuns: number; rejectedRunsCount: number } {
    return {
      activeRuns: this.activeRunsPerTenant.get(tenantId) || 0,
      rejectedRunsCount: this.rejectedRuns.get(tenantId) || 0
    };
  }

  public getActiveTenants(): string[] {
    return Array.from(this.activeRunsPerTenant.keys());
  }
}

