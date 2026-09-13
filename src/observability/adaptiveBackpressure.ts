/**
 * ResolveX Step 8 — Adaptive Backpressure & System Protection Controller
 * 
 * Monitors system pressure (queue depth, worker utilization, retry rate, circuit state, AI budget, DB pressure).
 * When system pressure increases:
 *  - Sheds/defers optional non-critical background work.
 *  - Reduces concurrency limit safely.
 *  - Applies backpressure delays to incoming background batch jobs.
 * 
 * NEVER drops critical customer-resolution actions silently.
 */

export interface SystemPressureState {
  queueDepth: number;
  workerUtilizationPct: number;
  transientRetryRate: number;
  activeCircuitBreakersOpen: number;
  systemPressureLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  backpressureActive: boolean;
  recommendedConcurrencyLimit: number;
  shedOptionalWork: boolean;
}

export class AdaptiveBackpressureController {
  private static instance: AdaptiveBackpressureController;
  private defaultConcurrency = 4;
  private minConcurrency = 1;

  private constructor() {}

  public static getInstance(): AdaptiveBackpressureController {
    if (!AdaptiveBackpressureController.instance) {
      AdaptiveBackpressureController.instance = new AdaptiveBackpressureController();
    }
    return AdaptiveBackpressureController.instance;
  }

  public evaluatePressure(metrics: {
    queueDepth: number;
    workerUtilizationPct: number;
    transientRetryRatePerSec: number;
    openCircuitBreakersCount: number;
  }): SystemPressureState {
    const { queueDepth, workerUtilizationPct, transientRetryRatePerSec, openCircuitBreakersCount } = metrics;

    let pressureLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NORMAL';
    let backpressureActive = false;
    let concurrency = this.defaultConcurrency;
    let shedOptional = false;

    if (queueDepth > 50 || workerUtilizationPct > 90 || transientRetryRatePerSec > 20 || openCircuitBreakersCount >= 2) {
      pressureLevel = 'CRITICAL';
      backpressureActive = true;
      concurrency = this.minConcurrency;
      shedOptional = true;
    } else if (queueDepth > 25 || workerUtilizationPct > 75 || transientRetryRatePerSec > 10 || openCircuitBreakersCount >= 1) {
      pressureLevel = 'HIGH';
      backpressureActive = true;
      concurrency = 2;
      shedOptional = true;
    } else if (queueDepth > 10 || workerUtilizationPct > 50 || transientRetryRatePerSec > 5) {
      pressureLevel = 'ELEVATED';
      backpressureActive = false;
      concurrency = 3;
      shedOptional = false;
    }

    return {
      queueDepth,
      workerUtilizationPct,
      transientRetryRate: transientRetryRatePerSec,
      activeCircuitBreakersOpen: openCircuitBreakersCount,
      systemPressureLevel: pressureLevel,
      backpressureActive,
      recommendedConcurrencyLimit: concurrency,
      shedOptionalWork: shedOptional,
    };
  }
}

export class AdaptiveBackpressureEngine {
  private static instance: AdaptiveBackpressureEngine;
  private currentLevel: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL' = 'NORMAL';
  private shedOptionalWork: boolean = false;
  private shedStats: Record<string, number> = {};

  private constructor() {}

  public static getInstance(): AdaptiveBackpressureEngine {
    if (!AdaptiveBackpressureEngine.instance) {
      AdaptiveBackpressureEngine.instance = new AdaptiveBackpressureEngine();
    }
    return AdaptiveBackpressureEngine.instance;
  }

  public reset(): void {
    this.currentLevel = 'NORMAL';
    this.shedOptionalWork = false;
    this.shedStats = {};
  }

  public evaluatePressure(metrics: {
    queueDepth: number;
    workerUtilization?: number;
    errorRate?: number;
    openCircuitRatio?: number;
  }): { level: 'NORMAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL'; shedOptionalWork: boolean } {
    const qd = metrics.queueDepth || 0;
    const wu = (metrics.workerUtilization || 0) * 100;
    const err = metrics.errorRate || 0;
    const circuitRatio = metrics.openCircuitRatio || 0;

    if (qd >= 1000 || err >= 0.3) {
      this.currentLevel = 'CRITICAL';
      this.shedOptionalWork = true;
    } else if (qd >= 400 || wu >= 85 || circuitRatio >= 0.5) {
      this.currentLevel = 'HIGH';
      this.shedOptionalWork = true;
    } else if (qd >= 100 || wu >= 50) {
      this.currentLevel = 'ELEVATED';
      this.shedOptionalWork = false;
    } else {
      this.currentLevel = 'NORMAL';
      this.shedOptionalWork = false;
    }

    return {
      level: this.currentLevel,
      shedOptionalWork: this.shedOptionalWork
    };
  }

  public shouldAcceptTask(taskName: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'): { accepted: boolean; reason?: string } {
    if (priority === 'CRITICAL' || taskName.includes('MUTATION')) {
      return { accepted: true };
    }
    if (this.shedOptionalWork && (priority === 'LOW' || taskName.includes('BACKGROUND') || taskName.includes('ANALYTICAL'))) {
      this.shedStats[taskName] = (this.shedStats[taskName] || 0) + 1;
      return { accepted: false, reason: 'Backpressure work shedding active' };
    }
    return { accepted: true };
  }

  public getShedStats(): Record<string, number> {
    return { ...this.shedStats };
  }

  public getStatusSummary(): { currentLevel: string; shedOptionalWork: boolean } {
    return {
      currentLevel: this.currentLevel,
      shedOptionalWork: this.shedOptionalWork
    };
  }
}

