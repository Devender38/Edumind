// ResolveX Deterministic Evaluation Golden Dataset — Phase 15
// Contains 50 explicit, deterministic ground-truth evaluation cases

import { GroundTruthCase } from './types.js';

export const DATASET_VERSION = '15.0.0-golden';

export const GOLDEN_DATASET: GroundTruthCase[] = [
  // ----------------------------------------------------
  // 1. LOW-VALUE AUTO REFUNDS (<= ₹10,000)
  // ----------------------------------------------------
  {
    id: 'CASE-001',
    name: 'Earbuds ₹4,999 Auto Refund - Damaged Item',
    category: 'LOW_VALUE_REFUND',
    input: {
      message: 'I want a refund for my ₹4,999 earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      customerId: 'cust-standard-002',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-002',
    name: 'Earbuds ₹4,999 Auto Refund - Defective Audio',
    category: 'LOW_VALUE_REFUND',
    input: {
      message: 'I want a refund for defective earbuds ord-refund-4999.',
      orderId: 'ord-refund-4999',
    },
    expected: {
      intentIssueType: 'DEFECTIVE_ITEM',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-003',
    name: 'Earbuds ₹4,999 Auto Refund - Late Delivery Complaint',
    category: 'LOW_VALUE_REFUND',
    input: {
      message: 'I want a refund for late delivery of ord-refund-4999.',
      orderId: 'ord-refund-4999',
    },
    expected: {
      intentIssueType: 'LATE_DELIVERY',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-004',
    name: 'Earbuds ₹4,999 Auto Refund - Wrong Item Delivered',
    category: 'LOW_VALUE_REFUND',
    input: {
      message: 'I want a refund for wrong item ord-refund-4999.',
      orderId: 'ord-refund-4999',
    },
    expected: {
      intentIssueType: 'WRONG_ITEM',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-005',
    name: 'Earbuds ₹4,999 Auto Refund - Missing Package Accessory',
    category: 'LOW_VALUE_REFUND',
    input: {
      message: 'I want a refund for missing items ord-refund-4999.',
      orderId: 'ord-refund-4999',
    },
    expected: {
      intentIssueType: 'MISSING_ITEM',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },

  // ----------------------------------------------------
  // 2. HIGH-VALUE REFUNDS (> ₹10,000 REQUIRES APPROVAL)
  // ----------------------------------------------------
  {
    id: 'CASE-006',
    name: 'Smartphone ₹24,999 Refund - Requires Manager Approval Gate',
    category: 'HIGH_VALUE_REFUND',
    input: {
      message: 'I want a refund for my ₹24,999 smartphone order ord-phone-24999.',
      orderId: 'ord-phone-24999',
      ticketId: 'tkt-damaged-phone-001',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: true,
      selectedAction: 'REFUND',
      finalStatus: 'WAITING_FOR_APPROVAL',
      expectedMutations: 0,
    },
  },
  {
    id: 'CASE-007',
    name: 'Smartphone ₹24,999 Refund - Approved via Token Resume',
    category: 'HIGH_VALUE_REFUND',
    input: {
      message: 'I want a refund for my ₹24,999 smartphone order ord-phone-24999.',
      orderId: 'ord-phone-24999',
      approvalToken: 'appr-mgr-999-valid',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      policyEligible: true,
      approvalRequired: true,
      selectedAction: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-008',
    name: 'Smartphone ₹24,999 Refund - Manager Rejection Escalates Safely',
    category: 'HIGH_VALUE_REJECTED',
    input: {
      message: 'I want a refund for my ₹24,999 smartphone order ord-phone-24999.',
      orderId: 'ord-phone-24999',
      approvalToken: 'REJECTED',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      approvalRequired: true,
      finalStatus: 'ESCALATED',
      expectedMutations: 0,
    },
  },

  // ----------------------------------------------------
  // 3. ORDER CANCELLATIONS
  // ----------------------------------------------------
  {
    id: 'CASE-009',
    name: 'Processing Order Cancellation - Within Window',
    category: 'CANCELLATION',
    input: {
      message: 'Cancel my order ord-cancel-3500 immediately.',
      orderId: 'ord-cancel-3500',
    },
    expected: {
      intentIssueType: 'CANCELLATION_REQUEST',
      requestedResolution: 'CANCELLATION',
      policyEligible: true,
      approvalRequired: false,
      selectedAction: 'CANCELLATION',
      finalStatus: 'RESOLVED',
      expectedMutations: 0,
      verificationStatus: 'SUCCESS',
    },
  },

  // ----------------------------------------------------
  // 4. FRAUD & HIGH RISK CUSTOMER POLICY BLOCKS
  // ----------------------------------------------------
  {
    id: 'CASE-010',
    name: 'High Risk Fraud Customer Flag',
    category: 'FRAUD_RISK',
    input: {
      message: 'I want a refund for my earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      customerId: 'cust-risk-003',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      approvalRequired: true,
      finalStatus: 'WAITING_FOR_APPROVAL',
      expectedMutations: 0,
    },
  },

  // ----------------------------------------------------
  // 5. OUT-OF-STOCK REPLACEMENT & CUSTOMER CONSENT GATING
  // ----------------------------------------------------
  {
    id: 'CASE-011',
    name: 'Out-Of-Stock Phone Replacement - Customer Consent Required Gate',
    category: 'REPLACEMENT_CONSENT',
    input: {
      message: 'I want a replacement for my damaged smartphone order ord-phone-24999.',
      orderId: 'ord-phone-24999',
      ticketId: 'tkt-damaged-phone-001',
      customerConsentGiven: false,
    },
    expected: {
      intentIssueType: 'DAMAGED_ITEM',
      requestedResolution: 'REPLACEMENT',
      consentRequired: true,
      finalStatus: 'WAITING_FOR_CUSTOMER_CONSENT',
      expectedMutations: 0,
    },
  },
  {
    id: 'CASE-012',
    name: 'Out-Of-Stock Replacement - Consent Granted Alternative SKU',
    category: 'CONSENT_GRANTED',
    input: {
      message: 'I want a replacement for my damaged smartphone order ord-phone-24999.',
      orderId: 'ord-phone-24999',
      ticketId: 'tkt-damaged-phone-001',
      customerConsentGiven: true,
    },
    expected: {
      intentIssueType: 'DAMAGED_ITEM',
      requestedResolution: 'REPLACEMENT',
      consentRequired: true,
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },

  // ----------------------------------------------------
  // 6. IDEMPOTENCY & DUPLICATE PROTECTION
  // ----------------------------------------------------
  {
    id: 'CASE-013',
    name: 'Duplicate Refund Request - Idempotency Key Replay',
    category: 'IDEMPOTENCY_DUPLICATE',
    input: {
      message: 'I want a refund for my ₹4,999 earbuds order.',
      orderId: 'ord-refund-4999',
      idempotencyKey: 'idemp-eval-duplicate-013',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-014',
    name: 'Duplicate Refund Request - Second Execution Yields Zero Additional Mutations',
    category: 'IDEMPOTENCY_DUPLICATE',
    input: {
      message: 'I want a refund for my ₹4,999 earbuds order.',
      orderId: 'ord-refund-4999',
      idempotencyKey: 'idemp-eval-duplicate-013',
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },

  // ----------------------------------------------------
  // 7. VERIFICATION FAILURE & SAFETY ESCALATION
  // ----------------------------------------------------
  {
    id: 'CASE-015',
    name: 'Post-Action Verification Contradiction - Safe Escalation',
    category: 'VERIFICATION_FAILURE',
    input: {
      message: 'I want a refund for my earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      failureInjection: {
        point: 'AFTER_VERIFICATION',
        target: 'verifyGroundTruth',
        failOnce: false,
      },
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'ESCALATED',
      expectedMutations: 1,
      verificationStatus: 'FAILED',
    },
  },

  // ----------------------------------------------------
  // 8. TRANSIENT TOOL FAILURE & BOUNDED RETRY
  // ----------------------------------------------------
  {
    id: 'CASE-016',
    name: 'Transient Payment API Error - Bounded Retry Recovery',
    category: 'TOOL_FAILURE',
    input: {
      message: 'I want a refund for my earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      failureInjection: {
        point: 'BEFORE_TOOL',
        target: 'issueRefund',
        failOnce: true,
      },
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },
  {
    id: 'CASE-017',
    name: 'Persistent Payment API Error - Retry Exhaustion Escalate',
    category: 'RETRY_EXHAUSTION',
    input: {
      message: 'I want a refund for my earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      failureInjection: {
        point: 'BEFORE_TOOL',
        target: 'issueRefund',
        failOnce: false,
      },
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'ESCALATED',
      expectedMutations: 0,
    },
  },

  // ----------------------------------------------------
  // 9. MUTATION AMBIGUITY & RECONCILIATION
  // ----------------------------------------------------
  {
    id: 'CASE-018',
    name: 'Crash Window After DB Mutation - Ground-Truth Reconcile',
    category: 'ACTION_AMBIGUITY',
    input: {
      message: 'I want a refund for my earbuds order ord-refund-4999.',
      orderId: 'ord-refund-4999',
      failureInjection: {
        point: 'AFTER_ACTION_MUTATION',
        target: 'issueRefund',
        failOnce: true,
      },
    },
    expected: {
      intentIssueType: 'REFUND_REQUEST',
      requestedResolution: 'REFUND',
      finalStatus: 'RESOLVED',
      expectedMutations: 1,
      verificationStatus: 'SUCCESS',
    },
  },

  // ----------------------------------------------------
  // 10. EXPANDED MATRIX FOR HIGH-DENSITY EVALUATION (CASES 19 - 50)
  // ----------------------------------------------------
  {
    id: 'CASE-019',
    name: 'Audio Pods ₹4,999 - Package Never Delivered Missing Item',
    category: 'LOW_VALUE_REFUND',
    input: { message: 'I want a refund for missing package ord-refund-4999.', orderId: 'ord-refund-4999' },
    expected: { intentIssueType: 'MISSING_ITEM', requestedResolution: 'REFUND', policyEligible: true, finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-020',
    name: 'Audio Pods ₹4,999 - Battery Fault Defective Product',
    category: 'LOW_VALUE_REFUND',
    input: { message: 'I want a refund for defective battery ord-refund-4999.', orderId: 'ord-refund-4999' },
    expected: { intentIssueType: 'DEFECTIVE_ITEM', requestedResolution: 'REFUND', policyEligible: true, finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-021',
    name: 'Smartphone ₹24,999 - Screen Shattered High-Value Approval',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for my ₹24,999 phone order ord-phone-24999.', orderId: 'ord-phone-24999' },
    expected: { intentIssueType: 'REFUND_REQUEST', requestedResolution: 'REFUND', approvalRequired: true, finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-022',
    name: 'Smartphone ₹24,999 - Dead On Arrival High-Value Approval',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for dead phone ord-phone-24999.', orderId: 'ord-phone-24999' },
    expected: { intentIssueType: 'REFUND_REQUEST', requestedResolution: 'REFUND', approvalRequired: true, finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-023',
    name: 'Smartphone ₹24,999 - Wrong Color Model High-Value Approval',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for wrong color phone ord-phone-24999.', orderId: 'ord-phone-24999' },
    expected: { intentIssueType: 'WRONG_ITEM', requestedResolution: 'REFUND', approvalRequired: true, finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-024',
    name: 'Smartphone ₹24,999 - Stolen Package High-Value Approval',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for missing stolen phone ord-phone-24999.', orderId: 'ord-phone-24999' },
    expected: { intentIssueType: 'MISSING_ITEM', requestedResolution: 'REFUND', approvalRequired: true, finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-025',
    name: 'Smartphone ₹24,999 - Customer Changed Mind High-Value Approval',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for ord-phone-24999.', orderId: 'ord-phone-24999' },
    expected: { intentIssueType: 'REFUND_REQUEST', requestedResolution: 'REFUND', approvalRequired: true, finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-026',
    name: 'Out-Of-Stock Phone Replacement - No Consent Provided',
    category: 'REPLACEMENT_CONSENT',
    input: { message: 'Replace my broken phone ord-phone-24999.', orderId: 'ord-phone-24999', customerConsentGiven: false },
    expected: { intentIssueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', consentRequired: true, finalStatus: 'WAITING_FOR_CUSTOMER_CONSENT', expectedMutations: 0 },
  },
  {
    id: 'CASE-027',
    name: 'Out-Of-Stock Phone Replacement - Explicit Consent Granted',
    category: 'CONSENT_GRANTED',
    input: { message: 'Replace my broken phone ord-phone-24999.', orderId: 'ord-phone-24999', customerConsentGiven: true },
    expected: { intentIssueType: 'DAMAGED_ITEM', requestedResolution: 'REPLACEMENT', consentRequired: true, finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-028',
    name: 'Cancel Order ord-cancel-3500 - Valid Window',
    category: 'CANCELLATION',
    input: { message: 'Stop shipment for ord-cancel-3500.', orderId: 'ord-cancel-3500' },
    expected: { intentIssueType: 'CANCELLATION_REQUEST', requestedResolution: 'CANCELLATION', finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-029',
    name: 'Cancel Order ord-cancel-3500 - Buyer Remorse',
    category: 'CANCELLATION',
    input: { message: 'Cancel ord-cancel-3500 ordered by mistake.', orderId: 'ord-cancel-3500' },
    expected: { intentIssueType: 'CANCELLATION_REQUEST', requestedResolution: 'CANCELLATION', finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-030',
    name: 'Cancel Order ord-cancel-3500 - Price Match Cancel',
    category: 'CANCELLATION',
    input: { message: 'Found cheaper price elsewhere cancel ord-cancel-3500.', orderId: 'ord-cancel-3500' },
    expected: { intentIssueType: 'CANCELLATION_REQUEST', requestedResolution: 'CANCELLATION', finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-031',
    name: 'Idempotency Duplicate 031 - Second Attempt',
    category: 'IDEMPOTENCY_DUPLICATE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', idempotencyKey: 'key-case-031' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-032',
    name: 'Idempotency Duplicate 032 - Third Attempt',
    category: 'IDEMPOTENCY_DUPLICATE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', idempotencyKey: 'key-case-032' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-033',
    name: 'Transient Failure 033 - BEFORE_TOOL Retry',
    category: 'TOOL_FAILURE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'BEFORE_TOOL', target: 'issueRefund', failOnce: true } },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-034',
    name: 'Transient Failure 034 - AFTER_TOOL Retry',
    category: 'TOOL_FAILURE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'AFTER_TOOL', target: 'issueRefund', failOnce: true } },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-035',
    name: 'Persistent Failure 035 - Retry Exhaustion Escalates',
    category: 'RETRY_EXHAUSTION',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'BEFORE_TOOL', target: 'issueRefund', failOnce: false } },
    expected: { finalStatus: 'ESCALATED', expectedMutations: 0 },
  },
  {
    id: 'CASE-036',
    name: 'Crash Window 036 - AFTER_ACTION_MUTATION Ground Truth Recovery',
    category: 'ACTION_AMBIGUITY',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'AFTER_ACTION_MUTATION', target: 'issueRefund', failOnce: true } },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-037',
    name: 'Verification Failure 037 - Ground Truth Contradiction Escalate',
    category: 'VERIFICATION_FAILURE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'AFTER_VERIFICATION', target: 'verifyGroundTruth', failOnce: false } },
    expected: { finalStatus: 'ESCALATED', expectedMutations: 1, verificationStatus: 'FAILED' },
  },
  {
    id: 'CASE-038',
    name: 'VIP Customer Fast Track Refund',
    category: 'LOW_VALUE_REFUND',
    input: { message: 'I want a refund for ord-refund-4999', customerId: 'cust-primary-001', orderId: 'ord-refund-4999' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-039',
    name: 'High Risk Fraud Customer Block',
    category: 'POLICY_BLOCK',
    input: { message: 'I want a refund for ord-refund-4999', customerId: 'cust-risk-003', orderId: 'ord-refund-4999' },
    expected: { finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-040',
    name: 'High Risk Fraud Customer Phone Refund',
    category: 'FRAUD_RISK',
    input: { message: 'I want a refund for phone ord-phone-24999', customerId: 'cust-risk-003', orderId: 'ord-phone-24999' },
    expected: { finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-041',
    name: 'Invalid Ticket ID Search Error',
    category: 'INVALID_INPUT',
    input: { message: 'I want a refund for non-existent ticket', ticketId: 'non-existent-ticket-xyz' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 0 },
  },
  {
    id: 'CASE-042',
    name: 'Invalid Order ID Search Error',
    category: 'INVALID_INPUT',
    input: { message: 'I want a refund for invalid order ord-non-existent-999', orderId: 'ord-non-existent-999' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 0 },
  },
  {
    id: 'CASE-043',
    name: 'Low Value Auto Refund - Scratch on Screen',
    category: 'LOW_VALUE_REFUND',
    input: { message: 'I want a refund for scratch on earbuds ord-refund-4999', orderId: 'ord-refund-4999' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-044',
    name: 'Low Value Auto Refund - Accessories Missing',
    category: 'LOW_VALUE_REFUND',
    input: { message: 'I want a refund for cable missing from earbuds box ord-refund-4999', orderId: 'ord-refund-4999' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-045',
    name: 'High Value Phone Refund - Water Damage Claim',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for phone wet inside box ord-phone-24999', orderId: 'ord-phone-24999' },
    expected: { finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-046',
    name: 'High Value Phone Refund - Stolen In Transit',
    category: 'HIGH_VALUE_REFUND',
    input: { message: 'I want a refund for empty box ord-phone-24999', orderId: 'ord-phone-24999' },
    expected: { finalStatus: 'WAITING_FOR_APPROVAL', expectedMutations: 0 },
  },
  {
    id: 'CASE-047',
    name: 'Out-Of-Stock Replacement - Customer Refused Alternative',
    category: 'REPLACEMENT_CONSENT',
    input: { message: 'I want replacement phone ord-phone-24999', orderId: 'ord-phone-24999', customerConsentGiven: false },
    expected: { finalStatus: 'WAITING_FOR_CUSTOMER_CONSENT', expectedMutations: 0 },
  },
  {
    id: 'CASE-048',
    name: 'Out-Of-Stock Replacement - Customer Accepted Alternative',
    category: 'CONSENT_GRANTED',
    input: { message: 'I want replacement phone ord-phone-24999', orderId: 'ord-phone-24999', customerConsentGiven: true },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-049',
    name: 'Cancel Order ord-cancel-3500 - Duplicate Cancel Call',
    category: 'CANCELLATION',
    input: { message: 'Cancel ord-cancel-3500', orderId: 'ord-cancel-3500', idempotencyKey: 'cancel-dup-049' },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 0, verificationStatus: 'SUCCESS' },
  },
  {
    id: 'CASE-050',
    name: 'Transient Tool Failure - BEFORE_ACTION Injection Retry',
    category: 'TOOL_FAILURE',
    input: { message: 'I want a refund for ord-refund-4999', orderId: 'ord-refund-4999', failureInjection: { point: 'BEFORE_ACTION', target: 'issueRefund', failOnce: true } },
    expected: { finalStatus: 'RESOLVED', expectedMutations: 1, verificationStatus: 'SUCCESS' },
  },
];
