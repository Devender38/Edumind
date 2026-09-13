import { expect } from 'vitest';

/**
 * Authoritative Demo Scenarios Definition & Safety Invariants Fixture
 * Phase 11 & Phase 12 — End-to-End Integration & Durable Case Resume Flow
 */

export interface DemoScenario {
  id: string;
  name: string;
  message: string;
  ticketId?: string;
  orderId?: string;
  customerId?: string;
  customerConsentGiven?: boolean;
  approvalToken?: string;
  expectedIssueType?: string;
  expectedRequestedResolution?: string;
  expectedAmount?: number;
  expectedStatus: string;
  expectedApprovalRequired?: boolean;
  expectedExecuted?: boolean;
  expectedVerificationStatus?: string;
  expectedMutationCount: number;

  // Phase 12 Extensions
  waitingState?: string;
  resumeAction?: 'APPROVE' | 'REJECT' | 'GRANT' | 'DENY';
  expectedFinalStatePostResume?: string;
  expectedMutationCountPostResume?: number;
  expectedAuditEvent?: string;
}

export const CANONICAL_DEMO_SCENARIOS = {
  SCENARIO_A: {
    id: 'phone-24999-approval',
    name: 'Scenario A — High-Value Refund / Approval Gate',
    message: 'My ₹24,999 phone arrived damaged. I want a refund.',
    ticketId: 'tkt-damaged-phone-001',
    orderId: 'ord-phone-24999',
    customerId: 'cust-primary-001',
    customerConsentGiven: false,
    expectedIssueType: 'DAMAGED_ITEM',
    expectedRequestedResolution: 'REFUND',
    expectedAmount: 24999,
    expectedStatus: 'WAITING_FOR_APPROVAL',
    expectedApprovalRequired: true,
    expectedExecuted: false,
    expectedMutationCount: 0,
    waitingState: 'WAITING_FOR_APPROVAL',
    resumeAction: 'APPROVE',
    expectedFinalStatePostResume: 'RESOLVED',
    expectedMutationCountPostResume: 1,
    expectedAuditEvent: 'APPROVAL_GRANTED',
  } as DemoScenario,

  SCENARIO_B: {
    id: 'earbuds-4999-auto',
    name: 'Scenario B — Low-Value Auto Refund',
    message: 'I want a refund for my ₹4,999 earbuds order.',
    ticketId: 'tkt-damaged-phone-001',
    orderId: 'ord-refund-4999',
    customerId: 'cust-primary-001',
    expectedIssueType: 'REFUND_REQUEST',
    expectedRequestedResolution: 'REFUND',
    expectedAmount: 4999,
    expectedStatus: 'RESOLVED',
    expectedApprovalRequired: false,
    expectedExecuted: true,
    expectedVerificationStatus: 'SUCCESS',
    expectedMutationCount: 1,
  } as DemoScenario,

  SCENARIO_C: {
    id: 'out-of-stock-consent',
    name: 'Scenario C — Out of Stock -> Recovery -> Customer Consent Gate',
    message: 'I want a replacement for my damaged phone.',
    ticketId: 'tkt-damaged-phone-001',
    orderId: 'ord-phone-24999',
    customerId: 'cust-primary-001',
    customerConsentGiven: false,
    primaryProductId: 'prod-phone-001',
    primaryExpectedStock: 0,
    alternativeProductId: 'prod-phone-002',
    alternativeExpectedStock: 15,
    expectedIssueType: 'DAMAGED_ITEM',
    expectedRequestedResolution: 'REPLACEMENT',
    expectedStatus: 'WAITING_FOR_CUSTOMER_CONSENT',
    expectedExecuted: false,
    expectedMutationCount: 0,
    waitingState: 'WAITING_FOR_CUSTOMER_CONSENT',
    resumeAction: 'GRANT',
    expectedFinalStatePostResume: 'RESOLVED',
    expectedMutationCountPostResume: 1,
    expectedAuditEvent: 'CONSENT_GRANTED',
  } as DemoScenario & {
    primaryProductId: string;
    primaryExpectedStock: number;
    alternativeProductId: string;
    alternativeExpectedStock: number;
  },

  SCENARIO_D: {
    id: 'verification-failure',
    name: 'Scenario D — Verification Failure -> Escalation',
    message: 'Cancel my order.',
    ticketId: 'tkt-damaged-phone-001',
    orderId: 'ord-cancel-3500',
    customerId: 'cust-primary-001',
    expectedStatus: 'ESCALATED',
    expectedExecuted: false,
    expectedMutationCount: 0,
  } as DemoScenario,
};

/**
 * Reusable Assertion: Ensures RESOLVED state is NEVER claimed without verified ground-truth success.
 */
export function assertNeverFalseResolution(result: any) {
  if (result.status === 'RESOLVED') {
    expect(result.resolution?.confirmed).toBe(true);
    if (result.execution) {
      expect(result.execution.executed).toBe(true);
      expect(result.execution.verificationStatus).toBe('SUCCESS');
    }
  }
}

/**
 * Reusable Assertion: Ensures waiting states never perform unauthorized business mutations.
 */
export function assertWaitingStateNoMutations(result: any, refundCount: number, actionCount: number) {
  if (
    result.status === 'WAITING_FOR_APPROVAL' ||
    result.status === 'WAITING_FOR_CUSTOMER_CONSENT' ||
    result.status === 'BLOCKED'
  ) {
    expect(refundCount).toBe(0);
    expect(actionCount).toBe(0);
    expect(result.execution).toBeUndefined();
  }
}
