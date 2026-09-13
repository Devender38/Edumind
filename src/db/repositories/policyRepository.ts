// ResolveX Phase 20 — Durable Policy Repository & Change Control Governance

import { prisma } from '../client.js';
import { Logger } from '../../utils/logger.js';
import { FailureInjector } from '../../utils/failureInjector.js';
import {
  PolicyDefinition,
  PolicyRecord,
  PolicyVersionRecord,
  PolicyVersionStatus,
  PolicyDiff,
  PolicyDiffChange,
  PolicyMetrics,
} from '../../policy/types.js';

export interface CreatePolicyInput {
  tenantId: string;
  policyKey: string;
  name: string;
  description?: string;
  issueType: string;
  actionType: string;
  conditions: Record<string, any>;
  approvalRequired?: boolean;
  priority?: number;
  effectiveFrom?: Date | string | null;
  effectiveUntil?: Date | string | null;
  createdBy: string;
  autoActivate?: boolean;
}

export interface CreateVersionInput {
  policyId: string;
  name?: string;
  issueType?: string;
  actionType?: string;
  conditions?: Record<string, any>;
  approvalRequired?: boolean;
  priority?: number;
  changeSummary?: string;
  effectiveFrom?: Date | string | null;
  effectiveUntil?: Date | string | null;
  createdBy: string;
}

export class PolicyRepository {
  /**
   * Validates policy definition JSON for security, malformed structures, and prohibited code execution.
   */
  public static validateDefinition(def: any): PolicyDefinition {
    if (!def || typeof def !== 'object') {
      throw new Error('Invalid policy definition: Must be a non-null JSON object');
    }

    if (!def.issueType || typeof def.issueType !== 'string' || def.issueType.trim() === '') {
      throw new Error('Invalid policy definition: issueType is required');
    }

    if (!def.actionType || typeof def.actionType !== 'string' || def.actionType.trim() === '') {
      throw new Error('Invalid policy definition: actionType is required');
    }

    // Security check: Reject code injection attempts
    const rawString = JSON.stringify(def);
    const prohibitedKeywords = ['eval', '<script', 'Function(', 'process.env', 'child_process', 'require(', 'import('];
    for (const keyword of prohibitedKeywords) {
      if (rawString.includes(keyword)) {
        throw new Error(`Security Violation: Policy definition contains prohibited keyword '${keyword}'`);
      }
    }

    const priority = typeof def.priority === 'number' && def.priority >= 1 ? Math.floor(def.priority) : 1;

    return {
      issueType: def.issueType.trim().toUpperCase(),
      actionType: def.actionType.trim().toUpperCase(),
      conditions: typeof def.conditions === 'object' && def.conditions !== null ? def.conditions : {},
      approvalRequired: Boolean(def.approvalRequired),
      priority,
      description: def.description || undefined,
    };
  }

  /**
   * Creates a new Policy header and initial Version 1 (DRAFT or AUTO_ACTIVE).
   */
  /**
   * Creates a new Policy header and initial Version 1 (DRAFT or AUTO_ACTIVE).
   */
  public static async createPolicy(input: CreatePolicyInput): Promise<any> {
    FailureInjector.checkAndInject('BEFORE_POLICY_PERSIST');

    const validated = this.validateDefinition({
      issueType: input.issueType,
      actionType: input.actionType,
      conditions: input.conditions,
      approvalRequired: input.approvalRequired,
      priority: input.priority,
      description: input.description,
    });

    const tenantId = input.tenantId || 'tenant-a';

    // Check key collision
    const existing = await prisma.policy.findFirst({
      where: { tenantId, policyKey: input.policyKey },
    });
    if (existing) {
      throw new Error(`Policy with key '${input.policyKey}' already exists for tenant '${tenantId}'`);
    }

    const initialStatus: PolicyVersionStatus = input.autoActivate ? 'ACTIVE' : 'DRAFT';

    const result = await prisma.$transaction(async (tx) => {
      const policy = await tx.policy.create({
        data: {
          tenantId,
          policyKey: input.policyKey,
          name: input.name,
          description: input.description || null,
          issueType: validated.issueType,
          actionType: validated.actionType,
          conditions: JSON.stringify(validated.conditions),
          approvalRequired: validated.approvalRequired,
          priority: validated.priority,
          active: input.autoActivate ? true : false,
          status: input.autoActivate ? 'ACTIVE' : 'DRAFT',
        },
      });

      const version = await tx.policyVersion.create({
        data: {
          policyId: policy.id,
          version: 1,
          status: initialStatus,
          name: input.name,
          issueType: validated.issueType,
          actionType: validated.actionType,
          definition: JSON.stringify(validated),
          approvalRequired: validated.approvalRequired,
          priority: validated.priority,
          effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
          effectiveUntil: input.effectiveUntil ? new Date(input.effectiveUntil) : null,
          createdBy: input.createdBy,
          activatedBy: input.autoActivate ? input.createdBy : null,
          activatedAt: input.autoActivate ? new Date() : null,
          changeSummary: 'Initial policy creation (v1)',
        },
      });

      return { policy, version };
    });

    FailureInjector.checkAndInject('AFTER_POLICY_PERSIST');

    Logger.info({
      event: 'POLICY_CREATED',
      message: `Policy [${input.policyKey}] v1 created with status ${initialStatus}`,
      metadata: { policyId: result.policy.id, versionId: result.version.id, createdBy: input.createdBy, tenantId },
    });

    return {
      ...result.policy,
      policy: result.policy,
      version: result.version,
      versions: [result.version],
    } as any;
  }

  /**
   * Creates a new DRAFT PolicyVersion for an existing Policy.
   */
  public static async createVersion(
    policyIdOrInput: string | CreateVersionInput,
    inputOrTenant?: Partial<CreateVersionInput> | string,
    tenantIdArg?: string
  ): Promise<PolicyVersionRecord> {
    FailureInjector.checkAndInject('BEFORE_POLICY_PERSIST');

    let policyId: string;
    let input: Partial<CreateVersionInput>;

    if (typeof policyIdOrInput === 'string') {
      policyId = policyIdOrInput;
      input = (inputOrTenant as Partial<CreateVersionInput>) || {};
    } else {
      policyId = policyIdOrInput.policyId;
      input = policyIdOrInput;
    }

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    if (!policy) {
      throw new Error(`Policy not found with ID '${policyId}'`);
    }

    const latestVersion = policy.versions[0];
    const nextVersionNum = latestVersion ? latestVersion.version + 1 : 1;

    // Use latest definition as base if omitted
    const baseDefinition = latestVersion ? JSON.parse(latestVersion.definition) : {};
    const mergedDefinition = {
      issueType: input.issueType || baseDefinition.issueType || policy.issueType,
      actionType: input.actionType || baseDefinition.actionType || policy.actionType,
      conditions: input.conditions !== undefined ? input.conditions : (baseDefinition.conditions || JSON.parse(policy.conditions || '{}')),
      approvalRequired: input.approvalRequired !== undefined ? input.approvalRequired : (baseDefinition.approvalRequired ?? policy.approvalRequired),
      priority: input.priority !== undefined ? input.priority : (baseDefinition.priority ?? policy.priority),
      description: input.name || policy.name,
    };

    const validated = this.validateDefinition(mergedDefinition);

    const version = await prisma.policyVersion.create({
      data: {
        policyId: policy.id,
        version: nextVersionNum,
        status: 'DRAFT',
        name: input.name || policy.name,
        issueType: validated.issueType,
        actionType: validated.actionType,
        definition: JSON.stringify(validated),
        approvalRequired: validated.approvalRequired,
        priority: validated.priority,
        effectiveFrom: input.effectiveFrom ? new Date(input.effectiveFrom) : null,
        effectiveUntil: input.effectiveUntil ? new Date(input.effectiveUntil) : null,
        createdBy: input.createdBy || 'user-admin-1',
        changeSummary: input.changeSummary || `Version ${nextVersionNum} draft`,
      },
    });

    FailureInjector.checkAndInject('AFTER_POLICY_PERSIST');

    Logger.info({
      event: 'POLICY_VERSION_CREATED',
      message: `Policy [${policy.policyKey}] v${nextVersionNum} draft created`,
      metadata: { policyId: policy.id, versionId: version.id, createdBy: input.createdBy, tenantId: policy.tenantId },
    });

    return version as any;
  }

  /**
   * Updates a DRAFT version. Throws error if version is in APPROVED, ACTIVE, or RETIRED state.
   */
  public static async updateVersion(
    policyId: string,
    versionNum: number,
    updates: Record<string, any>,
    tenantId?: string
  ): Promise<PolicyVersionRecord> {
    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version || (tenantId && version.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${versionNum} not found for policy '${policyId}'`);
    }

    if (version.status !== 'DRAFT') {
      throw new Error(`Cannot update version in state ${version.status} (immutable)`);
    }

    const currentDef = JSON.parse(version.definition);
    const updatedDef = {
      ...currentDef,
      ...updates,
      conditions: updates.conditions ? updates.conditions : currentDef.conditions,
    };

    const updated = await prisma.policyVersion.update({
      where: { id: version.id },
      data: {
        name: updates.name || version.name,
        definition: JSON.stringify(updatedDef),
        changeSummary: updates.changeSummary || version.changeSummary,
      },
    });

    return updated as any;
  }

  /**
   * Submits a DRAFT policy version for approval (DRAFT → PENDING_APPROVAL).
   */
  public static async submitVersion(
    policyId: string,
    versionNum: number,
    arg3: string,
    arg4?: string
  ): Promise<PolicyVersionRecord> {
    let tenantId: string | undefined;
    let actorId: string;

    if (arg4) {
      tenantId = arg3;
      actorId = arg4;
    } else {
      actorId = arg3;
    }

    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version || (tenantId && version.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${versionNum} not found for policy '${policyId}'`);
    }

    if (version.status !== 'DRAFT') {
      throw new Error(`Cannot submit policy version in '${version.status}' state (must be DRAFT)`);
    }

    const updated = await prisma.policyVersion.update({
      where: { id: version.id },
      data: {
        status: 'PENDING_APPROVAL',
        submittedBy: actorId,
        submittedAt: new Date(),
      },
    });

    Logger.info({
      event: 'POLICY_SUBMITTED',
      message: `Policy [${version.policy.policyKey}] v${versionNum} submitted for approval`,
      metadata: { policyId, versionNum, submittedBy: actorId, tenantId: version.policy.tenantId },
    });

    return updated as any;
  }

  /**
   * Approves a PENDING_APPROVAL policy version (PENDING_APPROVAL → APPROVED).
   * Enforces separation of duties: Creator cannot self-approve unless explicitly allowed in test overrides.
   */
  /**
   * Approves a PENDING_APPROVAL policy version (PENDING_APPROVAL → APPROVED).
   * Enforces separation of duties: Creator cannot self-approve unless explicitly allowed in test overrides.
   */
  public static async approveVersion(
    policyId: string,
    versionNum: number,
    arg3: string,
    arg4?: string,
    arg5?: string | boolean,
    arg6?: boolean
  ): Promise<PolicyVersionRecord> {
    let tenantId: string | undefined;
    let approverId: string;
    let approverRole: string = 'APPROVER';
    let allowSelfApprove: boolean = false;

    if (typeof arg6 === 'boolean') {
      tenantId = arg3;
      approverId = arg4 || arg3;
      approverRole = typeof arg5 === 'string' ? arg5 : 'APPROVER';
      allowSelfApprove = arg6;
    } else if (typeof arg5 === 'boolean') {
      approverId = arg3;
      approverRole = arg4 || 'APPROVER';
      allowSelfApprove = arg5;
    } else if (arg4) {
      if (['APPROVER', 'ADMIN', 'OPERATOR', 'CUSTOMER', 'SERVICE'].includes(arg4)) {
        approverId = arg3;
        approverRole = arg4;
      } else {
        tenantId = arg3;
        approverId = arg4;
      }
    } else {
      approverId = arg3;
    }

    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version || (tenantId && version.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${versionNum} not found for policy '${policyId}'`);
    }

    if (version.status !== 'PENDING_APPROVAL') {
      throw new Error(`Cannot approve policy version in '${version.status}' state (must be PENDING_APPROVAL)`);
    }

    // Role check
    if (approverRole !== 'APPROVER' && approverRole !== 'ADMIN') {
      throw new Error(`Role '${approverRole}' is not authorized to approve policy versions`);
    }

    // Separation of duties check
    if (version.createdBy === approverId && !allowSelfApprove && approverRole !== 'ADMIN') {
      throw new Error(`Separation of duties violation: Creator '${approverId}' cannot self-approve policy version`);
    }

    const updated = await prisma.policyVersion.update({
      where: { id: version.id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });

    Logger.info({
      event: 'POLICY_APPROVED',
      message: `Policy [${version.policy.policyKey}] v${versionNum} approved by ${approverId}`,
      metadata: { policyId, versionNum, approvedBy: approverId, tenantId: version.policy.tenantId },
    });

    return updated as any;
  }

  /**
   * Activates an APPROVED policy version (APPROVED → ACTIVE).
   * Atomically retires the previously active version and updates Policy header.
   */
  public static async activateVersion(
    policyId: string,
    versionNum: number,
    arg3: string,
    arg4?: string
  ): Promise<PolicyVersionRecord> {
    FailureInjector.checkAndInject('BEFORE_POLICY_ACTIVATION');

    let tenantId: string | undefined;
    let activatorId: string;

    if (arg4) {
      tenantId = arg3;
      activatorId = arg4;
    } else {
      activatorId = arg3;
    }

    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version || (tenantId && version.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${versionNum} not found for policy '${policyId}'`);
    }

    if (version.status !== 'APPROVED' && version.status !== 'ACTIVE') {
      throw new Error(`Cannot activate policy version in '${version.status}' state (must be APPROVED or ACTIVE)`);
    }

    // Effective date check
    const now = new Date();
    if (version.effectiveFrom && new Date(version.effectiveFrom) > now) {
      throw new Error(`Cannot activate version ${versionNum}: Future effectiveFrom date (${version.effectiveFrom})`);
    }
    if (version.effectiveUntil && new Date(version.effectiveUntil) < now) {
      throw new Error(`Cannot activate version ${versionNum}: Expired effectiveUntil date (${version.effectiveUntil})`);
    }

    const parsedDefinition = JSON.parse(version.definition);

    const activatedVersion = await prisma.$transaction(async (tx) => {
      // 1. Retire existing active versions for this policy
      await tx.policyVersion.updateMany({
        where: {
          policyId,
          status: 'ACTIVE',
          id: { not: version.id },
        },
        data: {
          status: 'RETIRED',
          retiredBy: activatorId,
          retiredAt: now,
        },
      });

      // 2. Mark this version as ACTIVE
      const updatedV = await tx.policyVersion.update({
        where: { id: version.id },
        data: {
          status: 'ACTIVE',
          activatedBy: activatorId,
          activatedAt: now,
        },
      });

      // 3. Update Policy header for 100% backward compatibility with legacy queries
      await tx.policy.update({
        where: { id: policyId },
        data: {
          name: version.name || version.policy.name,
          issueType: version.issueType,
          actionType: version.actionType,
          conditions: JSON.stringify(parsedDefinition.conditions || {}),
          approvalRequired: version.approvalRequired,
          priority: version.priority,
          active: true,
          status: 'ACTIVE',
        },
      });

      return updatedV;
    });

    try {
      FailureInjector.checkAndInject('AFTER_POLICY_ACTIVATION');
    } catch (err: any) {
      Logger.error({
        event: 'AFTER_POLICY_ACTIVATION_FAILURE',
        message: `Post-activation error logged: ${err.message}`,
        metadata: { policyId, versionNum },
      });
    }

    Logger.info({
      event: 'POLICY_ACTIVATED',
      message: `Policy [${version.policy.policyKey}] v${versionNum} activated by ${activatorId}`,
      metadata: { policyId, versionNum, activatedBy: activatorId, tenantId: version.policy.tenantId },
    });

    return activatedVersion as any;
  }

  /**
   * Retires an ACTIVE or APPROVED policy version.
   */
  public static async retireVersion(
    policyId: string,
    versionNum: number,
    arg3: string,
    arg4?: string
  ): Promise<PolicyVersionRecord> {
    let tenantId: string | undefined;
    let actorId: string;

    if (arg4) {
      tenantId = arg3;
      actorId = arg4;
    } else {
      actorId = arg3;
    }

    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version || (tenantId && version.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${versionNum} not found for policy '${policyId}'`);
    }

    if (version.status === 'RETIRED') {
      return version as any;
    }

    const retired = await prisma.$transaction(async (tx) => {
      const v = await tx.policyVersion.update({
        where: { id: version.id },
        data: {
          status: 'RETIRED',
          retiredBy: actorId,
          retiredAt: new Date(),
        },
      });

      // Check if any other active versions exist for this policy
      const remainingActive = await tx.policyVersion.findFirst({
        where: { policyId, status: 'ACTIVE' },
      });

      if (!remainingActive) {
        await tx.policy.update({
          where: { id: policyId },
          data: { active: false, status: 'RETIRED' },
        });
      }

      return v;
    });

    Logger.info({
      event: 'POLICY_RETIRED',
      message: `Policy [${version.policy.policyKey}] v${versionNum} retired by ${actorId}`,
      metadata: { policyId, versionNum, retiredBy: actorId, tenantId: version.policy.tenantId },
    });

    return retired as any;
  }

  /**
   * Rollback: Activates a previous approved or retired version.
   */
  public static async rollbackPolicy(
    policyId: string,
    targetVersionNum: number,
    arg3: string,
    arg4?: string
  ): Promise<PolicyVersionRecord> {
    let tenantId: string | undefined;
    let actorId: string;

    if (arg4) {
      tenantId = arg3;
      actorId = arg4;
    } else {
      actorId = arg3;
    }

    const targetVersion = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: targetVersionNum } },
      include: { policy: true },
    });

    if (!targetVersion || (tenantId && targetVersion.policy.tenantId !== tenantId)) {
      throw new Error(`Policy version ${targetVersionNum} not found for policy '${policyId}'`);
    }

    if (targetVersion.status === 'DRAFT' || targetVersion.status === 'PENDING_APPROVAL' || targetVersion.status === 'REJECTED') {
      throw new Error(`Cannot rollback to unapproved version ${targetVersionNum} (status: ${targetVersion.status})`);
    }

    // Re-approve if retired, then activate
    if (targetVersion.status === 'RETIRED') {
      await prisma.policyVersion.update({
        where: { id: targetVersion.id },
        data: { status: 'APPROVED' },
      });
    }

    const activated = await this.activateVersion(policyId, targetVersionNum, actorId);

    Logger.info({
      event: 'POLICY_ROLLBACK',
      message: `Policy [${targetVersion.policy.policyKey}] rolled back to v${targetVersionNum} by ${actorId}`,
      metadata: { policyId, targetVersionNum, actorId, tenantId: targetVersion.policy.tenantId },
    });

    return activated;
  }

  /**
   * Fetches active policy versions for a tenant (effective at effectiveAt timestamp).
   * Falls back to active legacy `Policy` rows if no versioned policies exist yet.
   */
  public static async getActivePolicies(
    tenantId: string = 'tenant-a',
    arg2?: string | Date,
    arg3?: string,
    arg4?: Date
  ): Promise<any[]> {
    FailureInjector.checkAndInject('BEFORE_POLICY_SELECTION');

    let issueType: string | undefined;
    let actionType: string | undefined;
    let effectiveAt: Date = new Date();

    if (arg2 instanceof Date) {
      effectiveAt = arg2;
    } else {
      issueType = arg2;
      actionType = arg3;
      if (arg4 instanceof Date) effectiveAt = arg4;
    }

    const whereClause: any = {
      status: 'ACTIVE',
      policy: { tenantId, active: true },
      AND: [
        { OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: effectiveAt } }] },
        { OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: effectiveAt } }] },
      ],
    };

    if (issueType) {
      whereClause.issueType = issueType;
    }
    if (actionType) {
      whereClause.actionType = actionType;
    }

    const versionedPolicies = await prisma.policyVersion.findMany({
      where: whereClause,
      include: { policy: true },
      orderBy: { priority: 'asc' },
    });

    if (versionedPolicies.length > 0) {
      FailureInjector.checkAndInject('AFTER_POLICY_SELECTION');
      return versionedPolicies.map((pv) => {
        const parsedDef = JSON.parse(pv.definition);
        return {
          id: pv.policy.id,
          policyKey: pv.policy.policyKey,
          versionId: pv.id,
          version: pv.version,
          name: pv.name || pv.policy.name,
          issueType: pv.issueType,
          actionType: pv.actionType,
          conditions: JSON.stringify(parsedDef.conditions || {}),
          approvalRequired: pv.approvalRequired,
          priority: pv.priority,
          active: true,
          status: pv.status,
          definition: parsedDef,
          effectiveFrom: pv.effectiveFrom,
          effectiveUntil: pv.effectiveUntil,
          approvedBy: pv.approvedBy,
          activatedBy: pv.activatedBy,
        };
      });
    }

    // 2. Legacy fallback if no versioned policies initialized yet
    const legacyPolicies = await prisma.policy.findMany({
      where: { tenantId, active: true },
      orderBy: { priority: 'asc' },
    });

    FailureInjector.checkAndInject('AFTER_POLICY_SELECTION');

    return legacyPolicies.map((lp) => ({
      id: lp.id,
      policyKey: lp.policyKey || 'DEFAULT',
      versionId: `legacy-${lp.id}`,
      version: 1,
      name: lp.name,
      issueType: lp.issueType,
      actionType: lp.actionType,
      conditions: lp.conditions,
      approvalRequired: lp.approvalRequired,
      priority: lp.priority,
      active: lp.active,
      status: 'ACTIVE',
      definition: {
        issueType: lp.issueType,
        actionType: lp.actionType,
        conditions: JSON.parse(lp.conditions || '{}'),
        approvalRequired: lp.approvalRequired,
        priority: lp.priority,
      },
    }));
  }

  /**
   * Serializes active policy versions into a pinned snapshot JSON string, redacting sensitive credentials.
   */
  public static serializeSnapshot(tenantId: string, agentRunId: string, policies: any[]): string {
    const sanitized = policies.map((p) => {
      const copy = JSON.parse(JSON.stringify(p));
      const redactKeys = ['secretToken', 'password', 'apiKey', 'secret', 'credentials'];

      const sanitizeObj = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const k of Object.keys(obj)) {
          if (redactKeys.includes(k)) {
            obj[k] = '[REDACTED]';
          } else if (typeof obj[k] === 'string' && (obj[k].startsWith('{') || obj[k].startsWith('['))) {
            try {
              const parsed = JSON.parse(obj[k]);
              sanitizeObj(parsed);
              obj[k] = JSON.stringify(parsed);
            } catch {}
          } else if (typeof obj[k] === 'object') {
            sanitizeObj(obj[k]);
          }
        }
      };

      sanitizeObj(copy);
      return copy;
    });

    return JSON.stringify({
      tenantId,
      agentRunId,
      pinnedAt: new Date().toISOString(),
      policies: sanitized,
    });
  }

  /**
   * Fetches a specific version of a policy.
   */
  public static async getVersion(policyId: string, versionNum: number, tenantId?: string): Promise<PolicyVersionRecord | null> {
    const version = await prisma.policyVersion.findUnique({
      where: { policyId_version: { policyId, version: versionNum } },
      include: { policy: true },
    });

    if (!version) return null;
    if (tenantId && version.policy.tenantId !== tenantId) return null;

    const parsedDef = JSON.parse(version.definition);
    return {
      ...version,
      definition: parsedDef,
    } as any;
  }

  /**
   * Alias for getPolicyWithVersions.
   */
  public static async getPolicy(policyId: string, tenantId?: string): Promise<PolicyRecord | null> {
    return this.getPolicyWithVersions(policyId, tenantId);
  }

  /**
   * Fetches policy header and all version history for tenant.
   */
  public static async getPolicyWithVersions(policyId: string, tenantId: string = 'tenant-a'): Promise<PolicyRecord | null> {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, tenantId },
      include: { versions: { orderBy: { version: 'desc' } } },
    });

    if (!policy) return null;

    const activeV = policy.versions.find((v) => v.status === 'ACTIVE') || null;

    return {
      ...policy,
      activeVersion: activeV as any,
    } as any;
  }

  /**
   * Lists policies for tenant with active version included.
   */
  public static async listPolicies(tenantId: string = 'tenant-a'): Promise<PolicyRecord[]> {
    const policies = await prisma.policy.findMany({
      where: { tenantId },
      include: { versions: { orderBy: { version: 'desc' } } },
      orderBy: { priority: 'asc' },
    });

    return policies.map((p) => ({
      ...p,
      activeVersion: p.versions.find((v) => v.status === 'ACTIVE') as any || null,
    })) as any;
  }

  /**
   * Computes a structured diff between two version definitions of a policy.
   */
  public static async computeDiff(policyId: string, v1Num: number, v2Num: number, tenantId?: string): Promise<PolicyDiff> {
    const v1 = await this.getVersion(policyId, v1Num, tenantId);
    const v2 = await this.getVersion(policyId, v2Num, tenantId);

    if (!v1 || !v2) {
      throw new Error(`One or both policy versions (${v1Num}, ${v2Num}) not found for policy '${policyId}'`);
    }

    const parseDef = (d: any) => typeof d === 'string' ? JSON.parse(d) : (d || {});
    const def1 = parseDef(v1.definition);
    const def2 = parseDef(v2.definition);

    const changes: PolicyDiffChange[] = [];

    const keys = Array.from(new Set([...Object.keys(def1), ...Object.keys(def2)]));
    for (const key of keys) {
      const val1 = def1[key];
      const val2 = def2[key];
      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        changes.push({
          field: key,
          oldValue: val1,
          newValue: val2,
          description: `Field '${key}' changed from ${JSON.stringify(val1)} to ${JSON.stringify(val2)}`,
        });
      }
    }

    return {
      policyId,
      v1: v1Num,
      v2: v2Num,
      fromVersion: v1Num,
      toVersion: v2Num,
      changes,
      identical: changes.length === 0,
    };
  }

  /**
   * Aggregates telemetry metrics for policies in a tenant.
   */
  public static async getMetrics(tenantId: string = 'tenant-a'): Promise<PolicyMetrics> {
    const totalPolicies = await prisma.policy.count({ where: { tenantId } });
    const activePolicies = await prisma.policy.count({ where: { tenantId, active: true } });

    const versions = await prisma.policyVersion.findMany({
      where: { policy: { tenantId } },
      select: { status: true },
    });

    return {
      totalPolicies,
      activePolicies,
      draftVersions: versions.filter((v) => v.status === 'DRAFT').length,
      pendingApprovalVersions: versions.filter((v) => v.status === 'PENDING_APPROVAL').length,
      approvedVersions: versions.filter((v) => v.status === 'APPROVED').length,
      retiredVersions: versions.filter((v) => v.status === 'RETIRED').length,
      totalEvaluations: 0, // Augmented by telemetry counters
    };
  }
}
