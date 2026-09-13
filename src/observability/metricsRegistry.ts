// ResolveX Phase 23 — Thread-Safe Bounded Metrics Registry & Prometheus Formatter

import { MetricDefinition, MetricLabelSet, MetricType } from './types.js';

export class MetricsRegistry {
  private static instance: MetricsRegistry;
  private definitions: Map<string, MetricDefinition> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }

  public register(def: MetricDefinition): void {
    if (this.definitions.has(def.name)) {
      throw new Error(`Metric '${def.name}' is already registered.`);
    }
    this.definitions.set(def.name, def);
  }

  public registerCounter(def: Omit<MetricDefinition, 'type'>): {
    inc: (labels?: MetricLabelSet, val?: number) => void;
  } {
    this.register({ ...def, type: 'COUNTER' });
    return {
      inc: (labels: MetricLabelSet = {}, val: number = 1) => {
        this.incrementCounter(def.name, val, labels);
      },
    };
  }

  public registerGauge(def: Omit<MetricDefinition, 'type'>): {
    set: (labels?: MetricLabelSet, val?: number) => void;
    inc: (labels?: MetricLabelSet, val?: number) => void;
    dec: (labels?: MetricLabelSet, val?: number) => void;
  } {
    this.register({ ...def, type: 'GAUGE' });
    return {
      set: (labels: MetricLabelSet = {}, val: number = 0) => {
        this.setGauge(def.name, val, labels);
      },
      inc: (labels: MetricLabelSet = {}, val: number = 1) => {
        const curr = this.getValue(def.name, labels);
        this.setGauge(def.name, curr + val, labels);
      },
      dec: (labels: MetricLabelSet = {}, val: number = 1) => {
        const curr = this.getValue(def.name, labels);
        this.setGauge(def.name, curr - val, labels);
      },
    };
  }

  public registerHistogram(def: Omit<MetricDefinition, 'type'> & { buckets?: number[] }): {
    observe: (val: number, labels?: MetricLabelSet) => void;
  } {
    this.register({ ...def, type: 'HISTOGRAM' });
    return {
      observe: (val: number, labels: MetricLabelSet = {}) => {
        this.observeHistogram(def.name, val, labels);
      },
    };
  }

  /**
   * Sanitizes label keys and values to prevent high cardinality and credential leakage.
   */
  public sanitizeLabels(labels: MetricLabelSet): MetricLabelSet {
    const sanitized: MetricLabelSet = {};
    for (const [key, val] of Object.entries(labels)) {
      // Exclude unbounded/high-cardinality label keys
      if (
        key === 'correlationId' ||
        key === 'customerMessage' ||
        key === 'bearerToken' ||
        key === 'secret' ||
        key === 'token' ||
        key === 'prompt' ||
        key === 'authorization'
      ) {
        continue;
      }
      const valStr = String(val)
        .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, '[REDACTED]')
        .replace(/secret[_\s]*key\s*[:=]\s*\S+/gi, '[REDACTED]')
        .replace(/"/g, "'")
        .replace(/\n/g, ' ');
      sanitized[key] = valStr;
    }
    return sanitized;
  }

  private buildKey(name: string, labels: MetricLabelSet): string {
    const cleanLabels = this.sanitizeLabels(labels);
    const sortedKeys = Object.keys(cleanLabels).sort();
    if (sortedKeys.length === 0) return name;
    const labelStr = sortedKeys.map((k) => `${k}="${cleanLabels[k]}"`).join(',');
    return `${name}{${labelStr}}`;
  }

  public incrementCounter(name: string, val: number = 1, labels: MetricLabelSet = {}): void {
    const key = this.buildKey(name, labels);
    const curr = this.counters.get(key) || 0;
    this.counters.set(key, curr + val);
  }

  public setGauge(name: string, val: number, labels: MetricLabelSet = {}): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, val);
  }

  public observeHistogram(name: string, val: number, labels: MetricLabelSet = {}): void {
    const key = this.buildKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(val);
    this.histograms.set(key, values);
  }

  public getValue(name: string, labels: MetricLabelSet = {}): number {
    const key = this.buildKey(name, labels);
    if (this.counters.has(key)) return this.counters.get(key)!;
    if (this.gauges.has(key)) return this.gauges.get(key)!;
    if (this.histograms.has(key)) {
      const vals = this.histograms.get(key)!;
      if (vals.length === 0) return 0;
      return vals.reduce((a, b) => a + b, 0) / vals.length; // Average
    }
    return 0;
  }

  public getRawHistogramValues(name: string, labels: MetricLabelSet = {}): number[] {
    const key = this.buildKey(name, labels);
    return this.histograms.get(key) || [];
  }

  public getContentType(): string {
    return 'text/plain; version=0.0.4; charset=utf-8';
  }

  public metrics(): string {
    return this.toPrometheusFormat();
  }

  /**
   * Serializes all registered metrics into standard Prometheus exposition text format.
   */
  public toPrometheusFormat(): string {
    const lines: string[] = [];

    for (const [name, def] of this.definitions.entries()) {
      lines.push(`# HELP ${name} ${def.help}`);
      lines.push(`# TYPE ${name} ${def.type.toLowerCase()}`);

      if (def.type === 'COUNTER') {
        let found = false;
        for (const [key, val] of this.counters.entries()) {
          if (key === name || key.startsWith(`${name}{`)) {
            lines.push(`${key} ${val}`);
            found = true;
          }
        }
        if (!found) {
          lines.push(`${name} 0`);
        }
      } else if (def.type === 'GAUGE') {
        let found = false;
        for (const [key, val] of this.gauges.entries()) {
          if (key === name || key.startsWith(`${name}{`)) {
            lines.push(`${key} ${val}`);
            found = true;
          }
        }
        if (!found) {
          lines.push(`${name} 0`);
        }
      } else if (def.type === 'HISTOGRAM') {
        let found = false;
        for (const [key, vals] of this.histograms.entries()) {
          if (key === name || key.startsWith(`${name}{`)) {
            const count = vals.length;
            const sum = vals.reduce((a, b) => a + b, 0);
            if (def.buckets) {
              for (const le of def.buckets) {
                const bucketCount = vals.filter((v) => v <= le).length;
                const baseKey = key.includes('{') ? key.replace('{', '_bucket{le="' + le + '",') : `${key}_bucket{le="${le}"}`;
                lines.push(`${baseKey} ${bucketCount}`);
              }
            }
            lines.push(`${key}_count ${count}`);
            lines.push(`${key}_sum ${sum}`);
            found = true;
          }
        }
        if (!found) {
          if (def.buckets) {
            for (const le of def.buckets) {
              lines.push(`${name}_bucket{le="${le}"} 0`);
            }
          }
          lines.push(`${name}_count 0`);
          lines.push(`${name}_sum 0`);
        }
      }
    }

    return lines.join('\n') + '\n';
  }

  public reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  public resetForTesting(): void {
    this.reset();
  }

  public clearAll(): void {
    this.definitions.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

export const metricsRegistry = MetricsRegistry.getInstance();
