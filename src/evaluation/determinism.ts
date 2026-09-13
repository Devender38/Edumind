// ResolveX Determinism & Replay Evaluator — Phase 15
// Measures repeated-run stability across critical cases (5 runs per case)

import { AgentOrchestrator } from '../agents/orchestrator/AgentOrchestrator.js';
import { seedDatabase } from '../db/seedDatabase.js';

export interface DeterminismResult {
  caseId: string;
  runsCount: number;
  deterministic: boolean;
  statuses: string[];
  intents: string[];
  actions: string[];
  mutations: number[];
}

export class DeterminismEvaluator {
  /**
   * Executes repeated-run replay testing on critical cases (default 5 runs per case)
   */
  public static async evaluateCaseDeterminism(
    caseId: string,
    message: string,
    ticketId?: string,
    orderId?: string,
    approvalToken?: string,
    customerConsentGiven?: boolean,
    runsCount: number = 5
  ): Promise<DeterminismResult> {
    const statuses: string[] = [];
    const intents: string[] = [];
    const actions: string[] = [];
    const mutations: number[] = [];

    for (let i = 1; i <= runsCount; i++) {
      // Re-seed DB before each replay run to ensure isolated ground-truth state
      await seedDatabase().catch(() => null);

      const res = await AgentOrchestrator.run({
        ticketId,
        orderId,
        message,
        approvalToken,
        customerConsentGiven,
        idempotencyKey: `det-${caseId}-run-${i}-${Date.now()}`,
      }).catch((err) => ({ status: 'ERROR', reason: err.message } as any));

      statuses.push(res.status);
      intents.push(res.intent?.issueType || 'NONE');
      actions.push(res.decision?.selectedAction || 'NONE');
      mutations.push(res.execution?.executed ? 1 : 0);
    }

    // Check strict equality across all runs
    const firstStatus = statuses[0];
    const firstIntent = intents[0];
    const firstAction = actions[0];
    const firstMutation = mutations[0];

    const deterministic =
      statuses.every((s) => s === firstStatus) &&
      intents.every((i) => i === firstIntent) &&
      actions.every((a) => a === firstAction) &&
      mutations.every((m) => m === firstMutation);

    return {
      caseId,
      runsCount,
      deterministic,
      statuses,
      intents,
      actions,
      mutations,
    };
  }
}
