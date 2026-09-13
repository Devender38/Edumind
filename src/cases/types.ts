// ResolveX Phase 21 — Advanced Customer Experience & Case Management Types

export type CustomerCaseStatus =
  | 'OPEN'
  | 'INVESTIGATING'
  | 'WAITING_FOR_CUSTOMER'
  | 'WAITING_FOR_APPROVAL'
  | 'PROCESSING'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'FAILED';

export type TimelineStage =
  | 'CREATED'
  | 'INVESTIGATING'
  | 'EVALUATING_POLICY'
  | 'WAITING_CUSTOMER'
  | 'WAITING_APPROVAL'
  | 'EXECUTING_ACTION'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'FAILED';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  stage: TimelineStage;
  title: string;
  description: string;
  actor: 'CUSTOMER' | 'SYSTEM' | 'OPERATOR' | 'RESOLVEX_AGENT';
  isCustomerVisible: boolean;
  metadata?: Record<string, any>;
}

export interface CaseDetail {
  id: string; // Ticket ID
  tenantId: string;
  customerId: string;
  customerName?: string;
  customerEmail?: string;
  orderId?: string | null;
  issueType: string;
  customerMessage: string;
  status: CustomerCaseStatus;
  priority: string;
  resolutionType?: string | null;
  resolutionSummary?: string | null;
  requiresCustomerAction: boolean;
  requiresOperatorApproval: boolean;
  currentRunId?: string | null;
  createdAt: string;
  updatedAt: string;
  order?: any;
  latestRun?: any;
  notifications?: any[];
  actionRecords?: any[];
}

export interface CaseFilterOptions {
  tenantId: string;
  customerId?: string;
  status?: CustomerCaseStatus | string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CaseSearchResult {
  cases: CaseDetail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
