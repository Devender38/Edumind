// ResolveX Phase 21 — Sensitive Redacting Customer & Operator Timeline Engine

import { TimelineEntry, TimelineStage } from './types.js';
import { CaseManager } from './CaseManager.js';

export class TimelineEngine {
  /**
   * Generates a chronologically sorted, redacted timeline of entries for a given ticket.
   * Filters out internal traces when `isOperator` is false.
   */
  public static generateTimeline(ticket: any, isOperator: boolean = false): TimelineEntry[] {
    if (!ticket) return [];

    const entries: TimelineEntry[] = [];

    // 1. Initial Creation Entry
    entries.push({
      id: `evt-created-${ticket.id}`,
      timestamp: new Date(ticket.createdAt).toISOString(),
      stage: 'CREATED',
      title: 'Case Opened',
      description: CaseManager.redactSensitiveText(
        `Resolution case opened for issue: ${ticket.issueType || 'General Inquiry'}`
      ),
      actor: 'CUSTOMER',
      isCustomerVisible: true,
      metadata: { issueType: ticket.issueType, orderId: ticket.orderId },
    });

    // 2. Process Agent Runs and Traces
    const runs = ticket.agentRuns || (ticket.latestRun ? [ticket.latestRun] : []);
    for (const run of runs) {
      if (run.startedAt) {
        entries.push({
          id: `evt-run-start-${run.id}`,
          timestamp: new Date(run.startedAt).toISOString(),
          stage: 'INVESTIGATING',
          title: 'ResolveX Agent Initiated',
          description: 'Autonomous agent began analyzing order history and case context.',
          actor: 'RESOLVEX_AGENT',
          isCustomerVisible: true,
          metadata: { runId: run.id, goal: run.goal },
        });
      }

      if (run.traces && Array.isArray(run.traces)) {
        for (const trace of run.traces) {
          const mapped = TimelineEngine.mapTraceToTimelineEntry(trace, run.id);
          if (mapped) {
            entries.push(mapped);
          }
        }
      }

      // Check run status events
      if (run.status === 'WAITING_FOR_CUSTOMER_CONSENT') {
        entries.push({
          id: `evt-wait-cust-${run.id}`,
          timestamp: new Date(run.updatedAt || run.startedAt).toISOString(),
          stage: 'WAITING_CUSTOMER',
          title: 'Customer Confirmation Required',
          description: 'Option formulated. Awaiting customer confirmation to proceed with resolution.',
          actor: 'RESOLVEX_AGENT',
          isCustomerVisible: true,
        });
      } else if (run.status === 'WAITING_FOR_APPROVAL') {
        entries.push({
          id: `evt-wait-appr-${run.id}`,
          timestamp: new Date(run.updatedAt || run.startedAt).toISOString(),
          stage: 'WAITING_APPROVAL',
          title: 'Operator Approval Requested',
          description: 'Proposed action exceeds automated threshold; submitted for operator review.',
          actor: 'RESOLVEX_AGENT',
          isCustomerVisible: true,
        });
      }
    }

    // 3. Process Action Records
    const actionRecords = ticket.actionRecords || [];
    for (const action of actionRecords) {
      const actionTime = new Date(action.createdAt || ticket.createdAt).toISOString();
      entries.push({
        id: `evt-action-${action.id}`,
        timestamp: actionTime,
        stage: 'EXECUTING_ACTION',
        title: `Action Executed: ${action.actionType}`,
        description: CaseManager.redactSensitiveText(
          `Executed ${action.actionType}${action.amount ? ` for ₹${action.amount}` : ''} (Ref: ${
            action.externalReference || action.id
          })`
        ),
        actor: 'RESOLVEX_AGENT',
        isCustomerVisible: true,
        metadata: { actionId: action.id, actionType: action.actionType, amount: action.amount },
      });

      if (action.status === 'VERIFIED' || action.verified === true) {
        entries.push({
          id: `evt-verify-${action.id}`,
          timestamp: new Date(action.updatedAt || action.createdAt).toISOString(),
          stage: 'VERIFYING',
          title: 'Action Ground-Truth Verified',
          description: `Execution verified against system state. Outcome confirmed.`,
          actor: 'SYSTEM',
          isCustomerVisible: true,
        });
      }
    }

    // 4. Process Escalations
    const escalations = ticket.escalations || [];
    for (const esc of escalations) {
      entries.push({
        id: `evt-esc-${esc.id}`,
        timestamp: new Date(esc.createdAt).toISOString(),
        stage: 'ESCALATED',
        title: 'Case Escalated to Support Operator',
        description: CaseManager.redactSensitiveText(
          esc.reason || 'Case required manual specialist intervention.'
        ),
        actor: 'SYSTEM',
        isCustomerVisible: true,
        metadata: { priority: esc.priority, status: esc.status },
      });
    }

    // 5. Final State Summary Entry (if Ticket resolved or failed)
    const finalStatus = CaseManager.mapStatus(ticket, runs[runs.length - 1]);
    if (finalStatus === 'RESOLVED') {
      const summaryText = CaseManager.getResolutionSummary('RESOLVED', ticket, runs[runs.length - 1]);
      entries.push({
        id: `evt-resolved-${ticket.id}`,
        timestamp: new Date(ticket.updatedAt || ticket.createdAt).toISOString(),
        stage: 'RESOLVED',
        title: 'Case Successfully Resolved',
        description: CaseManager.redactSensitiveText(summaryText || 'Case successfully resolved.'),
        actor: 'RESOLVEX_AGENT',
        isCustomerVisible: true,
      });
    } else if (finalStatus === 'FAILED') {
      entries.push({
        id: `evt-failed-${ticket.id}`,
        timestamp: new Date(ticket.updatedAt || ticket.createdAt).toISOString(),
        stage: 'FAILED',
        title: 'Processing Failed',
        description: 'Case resolution could not be completed automatically.',
        actor: 'SYSTEM',
        isCustomerVisible: true,
      });
    }

    // Deduplicate entries by ID if any
    const uniqueEntries = Array.from(new Map(entries.map((e) => [e.id, e])).values());

    // Sort entries chronologically ascending
    uniqueEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Filter by visibility if customer
    if (!isOperator) {
      return uniqueEntries.filter((e) => e.isCustomerVisible);
    }

    return uniqueEntries;
  }

  private static mapTraceToTimelineEntry(trace: any, runId: string): TimelineEntry | null {
    const traceType = (trace.type || trace.step || '').toUpperCase();
    const isInternal =
      traceType.includes('PROMPT') ||
      traceType.includes('THOUGHT') ||
      traceType.includes('INTERNAL') ||
      traceType.includes('REASONING');

    let stage: TimelineStage = 'INVESTIGATING';
    let title = trace.title || 'Agent Processing Step';
    let isCustomerVisible = !isInternal;

    if (traceType.includes('INVESTIGAT')) {
      stage = 'INVESTIGATING';
      title = trace.title || 'Investigation Step';
    } else if (traceType.includes('POLICY')) {
      stage = 'EVALUATING_POLICY';
      title = trace.title || 'Policy Check';
    } else if (traceType.includes('CUSTOMER') || traceType.includes('CONSENT')) {
      stage = 'WAITING_CUSTOMER';
      title = trace.title || 'Customer Communication';
    } else if (traceType.includes('APPROVAL') || traceType.includes('MANAGER')) {
      stage = 'WAITING_APPROVAL';
      title = trace.title || 'Governance Check';
    } else if (traceType.includes('ACTION') || traceType.includes('TOOL')) {
      stage = 'EXECUTING_ACTION';
      title = trace.title || 'Tool Execution';
    } else if (traceType.includes('VERIFY')) {
      stage = 'VERIFYING';
      title = trace.title || 'Verification Step';
    } else if (traceType.includes('ESCALAT')) {
      stage = 'ESCALATED';
      title = trace.title || 'Escalation Event';
    }

    return {
      id: `evt-trace-${trace.id || Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(trace.timestamp || Date.now()).toISOString(),
      stage,
      title: CaseManager.redactSensitiveText(title),
      description: CaseManager.redactSensitiveText(trace.description || trace.output || ''),
      actor: 'RESOLVEX_AGENT',
      isCustomerVisible,
      metadata: { runId, step: trace.step, type: trace.type },
    };
  }
}
