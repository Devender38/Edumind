// ResolveX Phase 20 — Policy Governance, Versioning & Change Control Types

export type PolicyStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'RETIRED' | 'REJECTED';
export type PolicyVersionStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'RETIRED' | 'REJECTED';

export interface PolicyConditionsDefinition {
  maxAutoRefundAmount?: number;
  requiresApprovalAbove?: boolean;
  maxDaysPostDelivery?: number;
  allowedCustomerTiers?: string[];
  preferReplacementFirst?: boolean;
  [key: string]: any;
}

export interface PolicyDefinition {
  issueType: string;
  actionType: string;
  conditions: PolicyConditionsDefinition;
  approvalRequired: boolean;
  priority: number;
  description?: string;
}

export interface PolicyVersionRecord {
  id: string;
  policyId: string;
  version: number;
  status: PolicyVersionStatus;
  effectiveFrom?: Date | string | null;
  effectiveUntil?: Date | string | null;
  name?: string | null;
  issueType: string;
  actionType: string;
  definition: string; // JSON
  approvalRequired: boolean;
  priority: number;
  createdBy: string;
  submittedBy?: string | null;
  submittedAt?: Date | string | null;
  approvedBy?: string | null;
  approvedAt?: Date | string | null;
  activatedBy?: string | null;
  activatedAt?: Date | string | null;
  retiredBy?: string | null;
  retiredAt?: Date | string | null;
  changeSummary?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PolicyRecord {
  id: string;
  tenantId: string;
  policyKey: string;
  name: string;
  description?: string | null;
  issueType: string;
  actionType: string;
  conditions: string;
  approvalRequired: boolean;
  priority: number;
  active: boolean;
  status: PolicyStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  versions?: PolicyVersionRecord[];
  activeVersion?: PolicyVersionRecord | null;
}

export interface PinnedPolicySnapshot {
  policyId: string;
  policyKey: string;
  versionId: string;
  version: number;
  name: string;
  issueType: string;
  actionType: string;
  definition: PolicyDefinition;
  approvalRequired: boolean;
  priority: number;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  approvedBy?: string | null;
  activatedBy?: string | null;
  pinnedAt: string;
}

export interface PolicyDiffChange {
  field: string;
  oldValue: any;
  newValue: any;
  description: string;
}

export interface PolicyDiff {
  policyId: string;
  v1: number;
  v2: number;
  fromVersion?: number;
  toVersion?: number;
  changes: PolicyDiffChange[];
  identical: boolean;
}

export interface PolicyMetrics {
  totalPolicies: number;
  activePolicies: number;
  draftVersions: number;
  pendingApprovalVersions: number;
  approvedVersions: number;
  retiredVersions: number;
  totalEvaluations: number;
}
