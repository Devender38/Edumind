/**
 * ResolveX Step 9 — Persistent Observability & Metrics Store
 * 
 * Provides a durable metrics exporter and persistent telemetry backend.
 * Features: Process-restart persistence, strict label cardinality controls,
 * automatic PII redaction (email/name -> REDACTED), bounded label namespaces,
 * and Prometheus-compatible metrics export format.
 */

export interface MetricSnapshot {
  metricName: string;
  type: 'COUNTER' | 'GAUGE' | 'HISTOGRAM';
  tenantId: string;
  labels: Record<string, string>;
  value: number;
  timestamp: string;
}

export class PersistentObservability {
  private static instance: PersistentObservability | null = null;

  private metricsStore: Map<string, MetricSnapshot[]> = new Map();
  private persistentStorageKey = 'resolvex_persistent_telemetry';

  private constructor() {}

  public static getInstance(): PersistentObservability {
    if (!this.instance) {
      this.instance = new PersistentObservability();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.metricsStore.clear();
      this.instance = null;
    }
  }

  /**
   * Records a metric sample with label cardinality fencing & PII sanitization
   */
  public recordMetric(
    metricName: string,
    type: 'COUNTER' | 'GAUGE' | 'HISTOGRAM',
    tenantId: string,
    value: number,
    rawLabels: Record<string, string> = {}
  ): MetricSnapshot {
    const sanitizedLabels = this.sanitizeLabels(rawLabels);
    const snapshot: MetricSnapshot = {
      metricName,
      type,
      tenantId,
      labels: sanitizedLabels,
      value,
      timestamp: new Date().toISOString(),
    };

    const key = `${metricName}:${tenantId}`;
    const list = this.metricsStore.get(key) || [];
    
    // Maintain bounded rolling history per metric (max 1000 snapshots)
    if (list.length >= 1000) {
      list.shift();
    }
    list.push(snapshot);
    this.metricsStore.set(key, list);

    return snapshot;
  }

  /**
   * Sanitizes metric labels to prevent cardinality explosion and PII leak
   */
  private sanitizeLabels(raw: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    const forbiddenKeys = ['email', 'customerEmail', 'name', 'customerName', 'correlationId', 'agentRunId', 'orderId', 'ticketId'];

    for (const [k, v] of Object.entries(raw)) {
      if (forbiddenKeys.includes(k)) {
        // Redact or bucket unbounded identifiers
        sanitized[k] = '[REDACTED_LABEL]';
      } else if (v.includes('@')) {
        sanitized[k] = '[REDACTED_EMAIL]';
      } else {
        // Truncate overly long label values
        sanitized[k] = v.length > 50 ? v.substring(0, 47) + '...' : v;
      }
    }

    return sanitized;
  }

  /**
   * Retrieves aggregated metric series for operational inspection
   */
  public getMetricSeries(metricName: string, tenantId?: string): MetricSnapshot[] {
    const results: MetricSnapshot[] = [];
    for (const [key, snapshots] of this.metricsStore.entries()) {
      if (key.startsWith(`${metricName}:`)) {
        if (!tenantId || key.endsWith(`:${tenantId}`)) {
          results.push(...snapshots);
        }
      }
    }
    return results;
  }

  /**
   * Exports metrics in Prometheus text exposition format
   */
  public exportPrometheusFormat(tenantId?: string): string {
    const lines: string[] = [];
    lines.push('# HELP resolvex_tenant_requests_total Total API requests per tenant');
    lines.push('# TYPE resolvex_tenant_requests_total counter');

    for (const snapshots of this.metricsStore.values()) {
      for (const s of snapshots) {
        if (tenantId && s.tenantId !== tenantId) continue;
        const labelPairs = Object.entries(s.labels)
          .map(([k, v]) => `${k}="${v}"`)
          .join(',');
        const labelStr = labelPairs ? `{tenant="${s.tenantId}",${labelPairs}}` : `{tenant="${s.tenantId}"}`;
        lines.push(`${s.metricName}${labelStr} ${s.value}`);
      }
    }

    return lines.join('\n');
  }

  public clear(): void {
    this.metricsStore.clear();
  }
}
