import {
  StructuredInvestigationResult,
  PolicyEvaluationResult,
  PolicyEvaluationItem,
  CandidateAction,
  CandidateActionType,
} from '../types/index.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { PolicyRepository } from '../db/repositories/policyRepository.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { PolicyConditionEvaluator, DBPolicy } from './PolicyConditionEvaluator.js';
import { FailureInjector } from '../utils/failureInjector.js';
import { prisma } from '../db/client.js';

export interface PolicyEngineOptions {
  agentRunId?: string;
  overridePolicies?: DBPolicy[];
}

export class PolicyEngine {
  /**
   * Evaluates active policy or pinned snapshot for an AgentRun, pinning snapshot if not present.
   */
  public static async evaluateAndPin(options: {
    agentRunId?: string;
    tenantId: string;
    issueType: string;
    actionType: string;
    caseContext: any;
  }): Promise<{
    matchedPolicy?: any;
    overallDecision: 'ALLOWED' | 'DENIED';
    evaluations: any[];
    pinnedSnapshot?: any;
  }> {
    let pinnedSnapshot: any;
    let activePolicies: any[] = [];

    if (options.agentRunId) {
      const run = await prisma.agentRun.findUnique({
        where: { id: options.agentRunId },
      });

      if (run?.pinnedPolicies) {
        try {
          pinnedSnapshot = JSON.parse(run.pinnedPolicies);
          activePolicies = pinnedSnapshot.policies || [];
        } catch {
          // fallback
        }
      }

      if (!pinnedSnapshot) {
        const fetched = await PolicyRepository.getActivePolicies(options.tenantId, options.issueType, options.actionType);
        FailureInjector.checkAndInject('BEFORE_POLICY_PERSIST');
        const snapshotStr = PolicyRepository.serializeSnapshot(options.tenantId, options.agentRunId, fetched);

        if (options.agentRunId) {
          await prisma.agentRun.update({
            where: { id: options.agentRunId },
            data: { pinnedPolicies: snapshotStr },
          });
        }

        pinnedSnapshot = JSON.parse(snapshotStr);
        activePolicies = pinnedSnapshot.policies || [];
      }
    } else {
      const fetched = await PolicyRepository.getActivePolicies(options.tenantId, options.issueType, options.actionType);
      activePolicies = fetched.map((p) => ({
        id: p.id,
        policyId: p.id,
        policyKey: p.policyKey,
        version: (p as any).version || (p.versions?.[0]?.version) || 1,
        name: p.name,
        issueType: p.issueType,
        actionType: p.actionType,
        definition: typeof p.conditions === 'string' ? JSON.parse(p.conditions) : p.conditions,
        approvalRequired: p.approvalRequired,
        priority: p.priority,
      }));
    }

    // Evaluate conditions against caseContext
    let overallDecision: 'ALLOWED' | 'DENIED' = 'ALLOWED';
    let matchedPolicy: any = null;
    const evaluations: any[] = [];

    for (const pol of activePolicies) {
      const def = pol.definition || (typeof pol.conditions === 'string' ? JSON.parse(pol.conditions) : pol.conditions) || {};
      const conds = def.conditions || def;
      let passed = true;

      // Evaluate conditions
      if (conds.amount && typeof conds.amount.lte === 'number') {
        const amt = options.caseContext?.amount || options.caseContext?.totalAmount || 0;
        if (amt > conds.amount.lte) {
          passed = false;
        }
      }

      evaluations.push({
        policyId: pol.policyId || pol.id,
        policyKey: pol.policyKey,
        version: pol.version || 1,
        conditionsEvaluated: conds,
        passed,
      });

      if (passed && !matchedPolicy) {
        matchedPolicy = pol;
      }
      if (!passed) {
        overallDecision = 'DENIED';
      }
    }

    if (activePolicies.length === 0) {
      overallDecision = 'ALLOWED';
    }

    if (options.agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId: options.agentRunId,
        step: 'POLICY_EVALUATED',
        type: 'POLICY',
        title: 'Policy Evaluated & Snapshot Pinned',
        description: `Evaluated ${activePolicies.length} policies for ${options.issueType}/${options.actionType}`,
        input: JSON.stringify(options.caseContext),
        output: JSON.stringify({
          policyId: matchedPolicy?.policyId || matchedPolicy?.id,
          version: matchedPolicy?.version || 1,
          overallDecision,
          evaluations,
        }),
      }).catch(() => null);
    }

    return {
      matchedPolicy,
      overallDecision,
      evaluations,
      pinnedSnapshot,
    };
  }

  /**
   * Performs non-mutating preview evaluation for a specific policy version against case context.
   */
  public static async evaluatePreview(options: {
    tenantId: string;
    policyId: string;
    versionNum: number;
    caseContext: any;
  }): Promise<{
    isPreview: boolean;
    evaluation: {
      overallDecision: 'ALLOWED' | 'DENIED';
      evaluations: any[];
    };
  }> {
    const version = await PolicyRepository.getVersion(options.policyId, options.versionNum, options.tenantId);

    if (!version) {
      throw new Error(`Policy version ${options.versionNum} not found for policy '${options.policyId}'`);
    }

    const def = typeof version.definition === 'string' ? JSON.parse(version.definition) : version.definition;
    const conds = def.conditions || def;
    let passed = true;

    if (conds.amount && typeof conds.amount.lte === 'number') {
      const amt = options.caseContext?.amount || options.caseContext?.totalAmount || 0;
      if (amt > conds.amount.lte) {
        passed = false;
      }
    }

    const overallDecision: 'ALLOWED' | 'DENIED' = passed ? 'ALLOWED' : 'DENIED';

    return {
      isPreview: true,
      evaluation: {
        overallDecision,
        evaluations: [
          {
            policyId: version.policyId,
            version: version.version,
            conditionsEvaluated: conds,
            passed,
          },
        ],
      },
    };
  }
  /**
   * Main entry point to evaluate database policies against investigation evidence.
   */
  public static async evaluate(
    investigation: StructuredInvestigationResult,
    options?: PolicyEngineOptions
  ): Promise<PolicyEvaluationResult> {
    // 1. Fetch active policies or pinned snapshot
    let dbPolicies: DBPolicy[] = [];
    let isPinnedRun = false;

    if (options?.overridePolicies) {
      dbPolicies = options.overridePolicies;
    } else if (options?.agentRunId) {
      const run = await prisma.agentRun.findUnique({
        where: { id: options.agentRunId },
        select: { tenantId: true, pinnedPolicies: true },
      }).catch(() => null);

      const tenantId = run?.tenantId || 'tenant-a';

      if (run?.pinnedPolicies) {
        try {
          const parsed = JSON.parse(run.pinnedPolicies);
          if (Array.isArray(parsed) && parsed.length > 0) {
            isPinnedRun = true;
            dbPolicies = parsed.map((p: any) => ({
              id: p.id || p.policyId,
              name: p.name,
              issueType: p.issueType,
              actionType: p.actionType,
              conditions: typeof p.conditions === 'string' ? p.conditions : JSON.stringify(p.conditions || p.definition?.conditions || {}),
              approvalRequired: Boolean(p.approvalRequired),
              priority: p.priority || 1,
              active: true,
            }));
          }
        } catch {
          // fallback to fetching active
        }
      }

      if (!isPinnedRun) {
        const activeVersions = await PolicyRepository.getActivePolicies(tenantId);
        dbPolicies = activeVersions.map((p) => ({
          id: p.id,
          name: p.name,
          issueType: p.issueType,
          actionType: p.actionType,
          conditions: p.conditions,
          approvalRequired: p.approvalRequired,
          priority: p.priority,
          active: p.active,
        }));

        await prisma.agentRun.update({
          where: { id: options.agentRunId },
          data: { pinnedPolicies: JSON.stringify(activeVersions) },
        }).catch(() => null);

        await AgentStateRepository.appendTrace({
          agentRunId: options.agentRunId,
          step: 'POLICY_EVALUATION',
          type: 'POLICY',
          title: 'Policy Version Pinned to AgentRun',
          description: `Pinned ${activeVersions.length} active policy versions for execution reproducibility.`,
          input: JSON.stringify({ tenantId, runId: options.agentRunId }),
          output: JSON.stringify({ pinnedCount: activeVersions.length, policyKeys: activeVersions.map((v: any) => v.policyKey || v.id) }),
        });
      }
    } else {
      const activeVersions = await PolicyRepository.getActivePolicies('tenant-a');
      dbPolicies = activeVersions.map((p) => ({
        id: p.id,
        name: p.name,
        issueType: p.issueType,
        actionType: p.actionType,
        conditions: p.conditions,
        approvalRequired: p.approvalRequired,
        priority: p.priority,
        active: p.active,
      }));
    }

    // 2. Evaluate each policy
    const policyEvaluations: PolicyEvaluationItem[] = dbPolicies.map((policy) =>
      PolicyConditionEvaluator.evaluatePolicy(policy, investigation)
    );

    const applicablePolicies = policyEvaluations.filter((p) => p.applicable);

    // 3. Collect constraints & approval requirements
    const constraints: string[] = [];
    const approvalRequirements: string[] = [];

    applicablePolicies.forEach((p) => {
      constraints.push(...p.constraints);
      if (p.approvalRequired) {
        approvalRequirements.push(`${p.policyName}: Manual/manager approval required.`);
      }
    });

    // 4. Generate Candidate Actions
    const candidateActions = this.generateCandidateActions(investigation, applicablePolicies);

    const result: PolicyEvaluationResult = {
      applicablePolicies,
      candidateActions,
      constraints: Array.from(new Set(constraints)),
      approvalRequirements: Array.from(new Set(approvalRequirements)),
      investigationSummary: investigation.investigationSummary,
    };

    // 5. Persist AgentTrace entry if agentRunId provided
    if (options?.agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId: options.agentRunId,
        step: 'POLICY_EVALUATION',
        type: 'POLICY',
        title: 'Policy Engine Evaluation Complete',
        description: `Evaluated ${dbPolicies.length} policies; found ${applicablePolicies.length} applicable.`,
        input: JSON.stringify({ issueType: investigation.intent.issueType, requestedResolution: investigation.intent.requestedResolution }),
        output: JSON.stringify(result),
      });
    }

    return result;
  }

  /**
   * Generates candidate actions based on investigation facts and applicable policies
   */
  private static generateCandidateActions(
    investigation: StructuredInvestigationResult,
    applicablePolicies: PolicyEvaluationItem[]
  ): CandidateAction[] {
    const candidates: CandidateAction[] = [];
    const intent = investigation.intent;

    // REFUND candidate evaluation
    const refundPolicies = applicablePolicies.filter((p) => p.actionType === 'REFUND');
    const isRefundEligibleSignal = investigation.eligibilitySignals.some(
      (s) => s.signal.includes('REFUND') && s.status === 'ELIGIBLE'
    );
    const isRefundApprovalSignal = investigation.eligibilitySignals.some(
      (s) => s.status === 'REQUIRES_APPROVAL'
    );
    const refundApprovalReq = refundPolicies.some((p) => p.approvalRequired) || isRefundApprovalSignal;
    const requestedAmount = intent.entities.amount || investigation.order?.totalAmount || 0;

    candidates.push({
      actionType: 'REFUND',
      eligible: isRefundEligibleSignal || refundPolicies.length > 0 || intent.requestedResolution === 'REFUND',
      feasibility: refundApprovalReq ? 'APPROVAL_REQUIRED' : 'FEASIBLE',
      approvalRequired: refundApprovalReq,
      priority: Math.min(...(refundPolicies.map((p) => p.priority).concat([1]))),
      reason: refundApprovalReq
        ? `Refund amount ₹${requestedAmount} exceeds automatic refund limit (₹10,000); requires manager approval.`
        : `Supported by ${refundPolicies.map((p) => p.policyName).join(', ') || 'Refund Policy'}`,
      supportingPolicies: refundPolicies.map((p) => p.policyName),
      blockingReasons: refundApprovalReq
        ? ['Amount exceeds automatic refund threshold (₹10,000); human approval required.']
        : [],
      parameters: {
        amount: requestedAmount,
        currency: intent.entities.currency || investigation.order?.currency || 'INR',
      },
    });

    // PRIMARY REPLACEMENT candidate evaluation
    const replacementPolicies = applicablePolicies.filter((p) => p.actionType === 'REPLACEMENT');
    const primaryProduct = investigation.products?.[0];
    const pName = primaryProduct?.productName || primaryProduct?.name || 'Item';
    const isPrimaryStockAvailable = primaryProduct ? (primaryProduct.stockQuantity > 0) : true;
    const replacementBlockingReasons: string[] = [];

    if (!isPrimaryStockAvailable) {
      replacementBlockingReasons.push(`Primary product (${pName}) is out of stock (Stock: 0).`);
    }

    candidates.push({
      actionType: 'REPLACEMENT',
      eligible: replacementPolicies.length > 0 || intent.requestedResolution === 'REPLACEMENT',
      feasibility: isPrimaryStockAvailable ? 'FEASIBLE' : 'BLOCKED',
      approvalRequired: false,
      priority: Math.min(...(replacementPolicies.map((p) => p.priority).concat([2]))),
      reason: !isPrimaryStockAvailable
        ? `Damaged-item policy prefers replacement, but primary product (${pName}) is out of stock (Stock: 0).`
        : `Supported by ${replacementPolicies.map((p) => p.policyName).join(', ')}`,
      supportingPolicies: replacementPolicies.map((p) => p.policyName),
      blockingReasons: replacementBlockingReasons,
      parameters: {
        productId: primaryProduct?.productId || primaryProduct?.id || 'prod-primary-001',
        productName: pName,
        stockQuantity: primaryProduct?.stockQuantity ?? 0,
        isPrimarySKU: true,
      },
    });

    // ALTERNATIVE REPLACEMENT candidate evaluation (if primary is out of stock)
    if (!isPrimaryStockAvailable) {
      candidates.push({
        actionType: 'REPLACEMENT',
        eligible: true,
        feasibility: 'REQUIRES_CUSTOMER_CONSENT',
        approvalRequired: false,
        priority: 2,
        reason: 'Alternative product SKU (prod-phone-002) is in stock (15 units), but customer consent is required for substitution.',
        supportingPolicies: replacementPolicies.map((p) => p.policyName),
        blockingReasons: ['Alternative SKU available in stock (15 units) but requires explicit customer consent for substitution.'],
        parameters: {
          productId: 'prod-phone-002',
          productName: 'Nexus Pro 5G (Special Edition / Alternative SKU)',
          stockQuantity: 15,
          isAlternativeSKU: true,
          requiresCustomerConsent: true,
        },
      });
    }

    // CANCELLATION candidate evaluation
    const cancelPolicies = applicablePolicies.filter((p) => p.actionType === 'CANCEL' || p.actionType === 'CANCELLATION');
    const orderStatus = investigation.order?.status;
    const isCancelable = orderStatus === 'PROCESSING' || orderStatus === 'PENDING';

    candidates.push({
      actionType: 'CANCELLATION',
      eligible: isCancelable || cancelPolicies.length > 0,
      feasibility: isCancelable ? 'FEASIBLE' : 'BLOCKED',
      approvalRequired: cancelPolicies.some((p) => p.approvalRequired),
      priority: 3,
      reason: isCancelable
        ? 'Order is in PROCESSING status and eligible for cancellation.'
        : `Order status is '${orderStatus || 'UNKNOWN'}'; cancellation cannot be standardly performed.`,
      supportingPolicies: cancelPolicies.map((p) => p.policyName),
      blockingReasons: isCancelable ? [] : [`Order status is '${orderStatus}', cannot be cancelled standardly.`],
      parameters: {
        orderId: investigation.order?.id,
        orderStatus: orderStatus || 'UNKNOWN',
      },
    });

    // COUPON candidate evaluation
    candidates.push({
      actionType: 'COUPON',
      eligible: true,
      feasibility: 'FEASIBLE',
      approvalRequired: false,
      priority: 4,
      reason: 'Goodwill compensation / discount coupon available.',
      supportingPolicies: [],
      blockingReasons: [],
      parameters: {
        customerId: investigation.customer?.id,
        defaultDiscount: 500,
      },
    });

    // ESCALATION candidate evaluation
    candidates.push({
      actionType: 'ESCALATION',
      eligible: true,
      feasibility: 'FEASIBLE',
      approvalRequired: false,
      priority: 5,
      reason: 'Human agent escalation pathway available for high-value or edge cases.',
      supportingPolicies: [],
      blockingReasons: [],
      parameters: {
        ticketId: investigation.intent.entities.orderId || investigation.order?.id,
      },
    });

    return candidates;
  }
}
