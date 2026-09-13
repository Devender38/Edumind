/**
 * ResolveX Step 8 — Read-Only Parallel Investigator & Bounded Cache
 * 
 * Classifies tool operations into:
 *  - READ_ONLY (e.g. Order lookup, Payment status check, Inventory lookup)
 *  - MUTATION (e.g. Issue refund, Reserve replacement, Cancel order)
 *  - VERIFICATION (e.g. Verify Stripe transaction status)
 *  - HUMAN_GATE (e.g. Manager approval, Customer consent)
 * 
 * Executing independent READ_ONLY tasks concurrently improves latency.
 * STRICT CAUSAL ORDERING IS PRESERVED:
 *  - MUTATION -> VERIFICATION must remain strictly ordered.
 *  - APPROVAL -> MUTATION must remain strictly ordered.
 *  - CONSENT -> MUTATION must remain strictly ordered.
 */

export type DependencyCategory = 'READ_ONLY' | 'MUTATION' | 'VERIFICATION' | 'HUMAN_GATE';

export interface BoundedCacheEntry<T> {
  key: string;
  tenantId: string;
  value: T;
  createdAt: number;
  expiresAt: number;
}

export class ReadOnlyParallelInvestigator {
  private static instance: ReadOnlyParallelInvestigator;
  private static cache: Map<string, BoundedCacheEntry<any>> = new Map();
  private static maxCacheEntries = 1000;
  private static defaultTtlMs = 60000; // 1 minute

  private constructor() {}

  public static getInstance(): ReadOnlyParallelInvestigator {
    if (!ReadOnlyParallelInvestigator.instance) {
      ReadOnlyParallelInvestigator.instance = new ReadOnlyParallelInvestigator();
    }
    return ReadOnlyParallelInvestigator.instance;
  }

  public reset(): void {
    ReadOnlyParallelInvestigator.cache.clear();
  }

  public classifyTask(taskName: string): DependencyCategory {
    return ReadOnlyParallelInvestigator.classifyOperation(taskName);
  }

  public async executeParallelReads(
    tasks: Array<{ id?: string; type?: DependencyCategory; name: string; fn: () => Promise<any>; tenantId?: string }>,
    maxConcurrency?: number
  ): Promise<Array<{ status: 'fulfilled' | 'rejected'; value?: any; reason?: any }>> {
    for (const task of tasks) {
      const type = task.type || this.classifyTask(task.name);
      if (type !== 'READ_ONLY') {
        throw new Error(`Cannot execute non-READ_ONLY task in parallel read phase: ${task.name}`);
      }
    }
    const results = await Promise.allSettled(tasks.map(t => t.fn()));
    return results.map(res => {
      if (res.status === 'fulfilled') return { status: 'fulfilled', value: res.value };
      return { status: 'rejected', reason: res.reason };
    });
  }

  public async executeSequentialChain(
    tasks: Array<{ id: string; type: DependencyCategory; name: string; fn: () => Promise<any> }>
  ): Promise<void> {
    for (const task of tasks) {
      await task.fn();
    }
  }

  public async getCachedOrFetch<T>(tenantId: string, key: string, fetchFn: () => Promise<T>, ttlMs: number = 60000): Promise<T> {
    const cached = ReadOnlyParallelInvestigator.getCached<T>(key, tenantId);
    if (cached !== null) return cached;
    const value = await fetchFn();
    ReadOnlyParallelInvestigator.setCache(key, tenantId, value, ttlMs);
    return value;
  }

  public clearTenantCache(tenantId: string): void {
    for (const [k, entry] of ReadOnlyParallelInvestigator.cache.entries()) {
      if (entry.tenantId === tenantId) {
        ReadOnlyParallelInvestigator.cache.delete(k);
      }
    }
  }

  public static classifyOperation(operationName: string): DependencyCategory {
    const op = operationName.toUpperCase();
    if (op.startsWith('GET') || op.startsWith('SEARCH') || op.startsWith('LOOKUP') || op.startsWith('READ') || op.startsWith('CHECK')) {
      return 'READ_ONLY';
    }
    if (op.includes('REFUND') || op.includes('MUTATION') || op.includes('CANCEL') || op.includes('DISPATCH') || op.includes('RESERVE')) {
      return 'MUTATION';
    }
    if (op.includes('VERIFY') || op.includes('RECONCILE')) {
      return 'VERIFICATION';
    }
    if (op.includes('APPROVAL') || op.includes('CONSENT') || op.includes('GATE')) {
      return 'HUMAN_GATE';
    }
    return 'MUTATION'; // Fail-safe default
  }

  public static async executeParallelReads<T>(
    tasks: Array<{ name: string; fn: () => Promise<T>; tenantId: string }>
  ): Promise<T[]> {
    // Verify all tasks are strictly READ_ONLY
    for (const task of tasks) {
      const category = this.classifyOperation(task.name);
      if (category !== 'READ_ONLY') {
        throw new Error(`ILLEGAL_PARALLELIZATION: Operation '${task.name}' is categorized as '${category}' and MUST NOT be executed in parallel.`);
      }
    }

    // Execute concurrently
    return Promise.all(tasks.map((t) => t.fn()));
  }

  public static getCached<T>(key: string, tenantId: string): T | null {
    const fullKey = `${tenantId}:${key}`;
    const entry = this.cache.get(fullKey);

    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(fullKey);
      return null;
    }

    return entry.value as T;
  }

  public static setCache<T>(key: string, tenantId: string, value: T, ttlMs: number = this.defaultTtlMs): void {
    const fullKey = `${tenantId}:${key}`;

    if (this.cache.size >= this.maxCacheEntries) {
      // Evict oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(fullKey, {
      key,
      tenantId,
      value,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  }

  public static clearCache(): void {
    this.cache.clear();
  }
}

