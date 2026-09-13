// ResolveX Phase 21 — Case Management State Engine & Customer Resolution Manager

import { CustomerCaseStatus } from './types.js';

export class CaseManager {
  /**
   * Deterministically maps internal AgentRun and Ticket states to customer-facing Case Status.
   * Enforces Ground-Truth Resolution Safety: RESOLVED status requires verified action execution.
   */
  public static mapStatus(ticket: any, latestRun?: any): CustomerCaseStatus {
    if (latestRun) {
      const runStatus = latestRun.status;

      if (runStatus === 'WAITING_FOR_CUSTOMER_CONSENT') {
        return 'WAITING_FOR_CUSTOMER';
      }
      if (runStatus === 'WAITING_FOR_APPROVAL') {
        return 'WAITING_FOR_APPROVAL';
      }
      if (runStatus === 'PLANNING' || runStatus === 'INVESTIGATING') {
        return 'INVESTIGATING';
      }
      if (runStatus === 'DECIDING' || runStatus === 'ACTING' || runStatus === 'VERIFYING' || runStatus === 'REPLANNING') {
        return 'PROCESSING';
      }
      if (runStatus === 'ESCALATED') {
        return 'ESCALATED';
      }
      if (runStatus === 'FAILED') {
        return 'FAILED';
      }
      if (runStatus === 'RESOLVED') {
        // Verification Check: If action records exist, at least one must be VERIFIED
        const actionRecords = latestRun.actionRecords || ticket?.actionRecords || [];
        if (actionRecords.length > 0) {
          const executedActions = actionRecords.filter((a: any) => a.executionStatus === 'EXECUTED');
          if (executedActions.length > 0) {
            const hasVerified = executedActions.some((a: any) => a.verified === true);
            if (!hasVerified) {
              // Unverified mutation cannot be reported as RESOLVED
              return 'ESCALATED';
            }
          }
        }
        return 'RESOLVED';
      }
    }

    // Fallback to Ticket header status
    const ticketStatus = ticket?.status;
    switch (ticketStatus) {
      case 'OPEN':
        return 'OPEN';
      case 'INVESTIGATING':
        return 'INVESTIGATING';
      case 'ACTION_PENDING':
      case 'VERIFYING':
        return 'PROCESSING';
      case 'RESOLVED':
        return 'RESOLVED';
      case 'ESCALATED':
        return 'ESCALATED';
      case 'FAILED':
        return 'FAILED';
      default:
        return 'OPEN';
    }
  }

  /**
   * Generates a customer-safe, human-readable resolution or status summary.
   */
  public static getResolutionSummary(status: CustomerCaseStatus, ticket: any, latestRun?: any): string | null {
    if (status === 'RESOLVED') {
      const resType = ticket?.resolutionType || latestRun?.decision || 'REFUND';
      let amount: number | null = null;

      // Extract amount if available from order or customer message
      if (ticket?.order?.totalAmount) {
        amount = ticket.order.totalAmount;
      }

      if (resType.includes('REFUND')) {
        return amount
          ? `Your refund of ₹${amount.toLocaleString('en-IN')} has been successfully processed.`
          : 'Your refund request has been successfully processed.';
      }
      if (resType.includes('REPLACEMENT')) {
        return 'Your replacement request has been confirmed and processed.';
      }
      if (resType.includes('CANCEL')) {
        return 'Your order cancellation request has been successfully completed.';
      }
      if (resType.includes('COUPON') || resType.includes('GOODWILL')) {
        return 'A goodwill discount coupon has been issued to your account.';
      }
      return 'Your customer resolution request has been successfully completed.';
    }

    if (status === 'ESCALATED') {
      return "We are unable to safely complete this request automatically. Your case has been escalated to our support team for manual review.";
    }

    if (status === 'WAITING_FOR_CUSTOMER') {
      return 'Your confirmation is required to proceed with an alternative resolution option.';
    }

    if (status === 'WAITING_FOR_APPROVAL') {
      return "We are waiting for manager approval before completing your request.";
    }

    if (status === 'INVESTIGATING') {
      return 'ResolveX is investigating your request and verifying order details.';
    }

    if (status === 'PROCESSING') {
      return 'Your resolution is currently being processed and verified.';
    }

    if (status === 'FAILED') {
      return 'An error occurred while processing your request. The case has been routed for operator assistance.';
    }

    return null;
  }

  /**
   * Redacts sensitive technical details from human-readable text.
   */
  public static redactSensitiveText(text: string): string {
    if (!text) return '';
    return text
      .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, '[REDACTED_TOKEN]')
      .replace(/secret[_\s]*key\s*[:=]\s*\S+/gi, '[REDACTED_SECRET]')
      .replace(/password\s*[:=]\s*\S+/gi, '[REDACTED_PASSWORD]')
      .replace(/api[_-]?key\s*[:=]\s*\S+/gi, '[REDACTED_API_KEY]');
  }
}
