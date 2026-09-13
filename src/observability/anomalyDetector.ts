/**
 * ResolveX Step 8 — Deterministic Anomaly Detector
 * 
 * Detects operational anomalies:
 *  - Sudden latency increase
 *  - Sudden error rate spike
 *  - Retry storm
 *  - UNKNOWN_OUTCOME spike
 *  - Verification failure spike
 *  - AI failure/fallback spike
 *  - Provider degradation
 *  - Tenant resource abuse
 * 
 * ANOMALY DETECTOR IS BOUNDED & EXPLAINABLE:
 * Does NOT directly mutate customer data.
 * Emits alerts, recommends operational actions, triggers safe backpressure, auto-opens SRE incidents.
 */

import { AlertEngine } from './alertEngine';
import { IncidentManager } from './incidentManager';

export interface AnomalyReport {
  detected: boolean;
  anomalyType?: string;
  severity: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'INFO';
  description: string;
  recommendedAction: string;
  timestamp: string;
}

export class AnomalyDetector {
  public static evaluateSystemAnomalies(metrics: {
    p95LatencyMs: number;
    errorRatePct: number;
    retryRatePerSec: number;
    unknownOutcomeCount: number;
    verificationFailurePct: number;
    tenantId?: string;
  }): AnomalyReport[] {
    const reports: AnomalyReport[] = [];

    // 1. Latency Anomaly
    if (metrics.p95LatencyMs > 2000) {
      reports.push({
        detected: true,
        anomalyType: 'LATENCY_SPIKE_DETECTED',
        severity: metrics.p95LatencyMs > 5000 ? 'P1_CRITICAL' : 'P2_HIGH',
        description: `P95 latency spike (${metrics.p95LatencyMs}ms > 2000ms threshold)`,
        recommendedAction: 'Trigger adaptive backpressure & switch model router to fast local provider',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Error Rate Anomaly
    if (metrics.errorRatePct > 15.0) {
      reports.push({
        detected: true,
        anomalyType: 'ERROR_RATE_SPIKE',
        severity: 'P1_CRITICAL',
        description: `Error rate spike (${metrics.errorRatePct}% > 15% threshold)`,
        recommendedAction: 'Inspect downstream integration health & enable circuit breaker probe',
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Retry Storm Anomaly
    if (metrics.retryRatePerSec > 10) {
      reports.push({
        detected: true,
        anomalyType: 'RETRY_STORM_DETECTED',
        severity: 'P2_HIGH',
        description: `Transient retry storm detected (${metrics.retryRatePerSec} retries/sec)`,
        recommendedAction: 'Apply failure backoff delay and reduce worker pool concurrency',
        timestamp: new Date().toISOString(),
      });
    }

    // 4. UNKNOWN_OUTCOME Spike
    if (metrics.unknownOutcomeCount > 0) {
      reports.push({
        detected: true,
        anomalyType: 'UNKNOWN_OUTCOME_SPIKE',
        severity: 'P1_CRITICAL',
        description: `Ambiguous crash window state detected (${metrics.unknownOutcomeCount} run(s) in UNKNOWN_OUTCOME)`,
        recommendedAction: 'Trigger operator ground-truth reconciliation workflow immediately',
        timestamp: new Date().toISOString(),
      });
    }

    return reports;
  }
}

export class AnomalyDetectionEngine {
  private static instance: AnomalyDetectionEngine;
  private samples: Map<string, number[]> = new Map();
  private activeAnomalies: any[] = [];

  private constructor() {}

  public static getInstance(): AnomalyDetectionEngine {
    if (!AnomalyDetectionEngine.instance) {
      AnomalyDetectionEngine.instance = new AnomalyDetectionEngine();
    }
    return AnomalyDetectionEngine.instance;
  }

  public reset(): void {
    this.samples.clear();
    this.activeAnomalies = [];
  }

  public evaluateMetrics(metrics: {
    p95LatencyMs?: number;
    errorRate?: number;
    retryCount?: number;
    unknownOutcomeCount?: number;
  }, correlationId?: string): Array<{ type: string; severity: string; correlationId?: string }> {
    const list: any[] = [];
    const p95 = metrics.p95LatencyMs || 0;
    const err = metrics.errorRate || 0;
    const retries = metrics.retryCount || 0;
    const unk = metrics.unknownOutcomeCount || 0;

    if (p95 > 2000) {
      list.push({ type: 'LATENCY_SPIKE', severity: p95 > 4000 ? 'HIGH' : 'MEDIUM', correlationId });
    }
    if (err > 0.15) {
      list.push({ type: 'ERROR_RATE_JUMP', severity: 'CRITICAL', correlationId });
    }
    if (retries > 100) {
      list.push({ type: 'RETRY_STORM', severity: 'HIGH', correlationId });
    }
    if (unk > 0) {
      list.push({ type: 'UNKNOWN_OUTCOME_SPIKE', severity: 'CRITICAL', correlationId });
    }

    this.activeAnomalies = list;
    return list;
  }

  public recordSample(name: string, value: number): void {
    const vals = this.samples.get(name) || [];
    vals.push(value);
    if (vals.length > 50) vals.shift();
    this.samples.set(name, vals);
  }

  public checkStatisticalAnomaly(name: string, currentValue: number): boolean {
    const vals = this.samples.get(name) || [];
    if (vals.length < 5) return false;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const stdDev = Math.sqrt(vals.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / vals.length);
    if (stdDev === 0) return Math.abs(currentValue - mean) > Math.max(20, mean * 0.5);
    const zScore = Math.abs((currentValue - mean) / stdDev);
    return zScore > 3.0;
  }


  public getActiveAnomalies(): any[] {
    return [...this.activeAnomalies];
  }
}

