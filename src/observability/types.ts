// ResolveX Phase 23 — Observability, Metrics, SLO & Incident Management Types

export type MetricType = 'COUNTER' | 'GAUGE' | 'HISTOGRAM';

export interface MetricDefinition {
  name: string;
  help: string;
  type: MetricType;
  labelNames?: string[];
  buckets?: number[]; // For histograms
}

export interface MetricLabelSet {
  [key: string]: string;
}

export interface MetricSample {
  name: string;
  labels: MetricLabelSet;
  value: number;
  timestamp?: number;
}

export interface SLODefinition {
  id: string;
  name: string;
  description: string;
  target: number; // e.g. 0.999 for 99.9%
  windowHours: number;
  metricName: string;
  errorBudgetRemaining?: number;
  remainingErrorBudget?: number; // percentage alias (0 to 100)
  burnRate: number; // e.g. 1.0 = normal burn, 14.4 = 1hr exhaustion rate
  burnRateStatus?: 'NORMAL' | 'WARNING' | 'CRITICAL';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  currentValue: number;
  allowedFailures: number;
  totalOperations: number;
}

export type AlertSeverity = 'WARNING' | 'CRITICAL';
export type AlertStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'RESOLVED';

export interface AlertDefinition {
  id: string;
  name: string;
  severity: AlertSeverity;
  metricName: string;
  condition: 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ';
  threshold: number;
  windowMinutes: number;
  enabled: boolean;
  affectedComponent: string;
  isSafetyAlert?: boolean;
}

export interface AlertStateRecord {
  id?: string;
  tenantId: string;
  fingerprint: string;
  alertKey: string;
  definitionName?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  isFiring?: boolean;
  lastFiredAt: string;
  resolvedAt?: string | null;
}

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'MITIGATING' | 'RESOLVED' | 'CLOSED';

export interface IncidentRecord {
  id: string;
  tenantId: string;
  tenantScope?: string;
  incidentKey: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  status: IncidentStatus;
  affectedComponent: string;
  resolutionSummary?: string | null;
  sourceAlertId?: string | null;
  correlationIds?: string[];
  runIds?: string[];
  caseIds?: string[];
  timeline?: Array<{ timestamp: string; event: string; actor?: string; resolutionSummary?: string }>;
  openedAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentFilterOptions {
  tenantId?: string;
  status?: IncidentStatus | string;
  severity?: IncidentSeverity | string;
  search?: string;
  page?: number;
  limit?: number;
}
