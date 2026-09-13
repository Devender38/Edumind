// ResolveX Production Security, Authentication & Tenant Isolation Engine — Phase 16

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheckResponse } from '../types/index.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { LookupTools, PolicyTools, ActionTools, VerificationTools, ToolRegistry } from '../tools/index.js';
import { IntentAgent, InvestigationAgent, PolicyEngine, DecisionEngine, ActionExecutor, FailureRecoveryAgent, AgentOrchestrator } from '../agents/index.js';
import { EvaluationRunner } from '../evaluation/evaluator.js';
import { authenticate, requireRole, requireTenantIsolation } from '../auth/authMiddleware.js';
import { AuthService } from '../auth/authService.js';
import { validateSecurityInputs } from '../utils/securityValidation.js';
import { SecurityLogger } from '../utils/securityLogger.js';
import { ExecutionCoordinator } from '../execution/executionCoordinator.js';
import { ExecutionRepository } from '../db/repositories/executionRepository.js';
import { NotificationRepository } from '../db/repositories/notificationRepository.js';
import { NotificationDispatcher } from '../notifications/notificationDispatcher.js';
import { PolicyRepository } from '../db/repositories/policyRepository.js';
import { PolicyConditionEvaluator } from '../policy/PolicyConditionEvaluator.js';
import { caseRepository } from '../db/repositories/caseRepository.js';
import { prisma } from '../db/client.js';
import { loadConfig, getRuntimeMetadata } from '../config/index.js';
import { metricsRegistry, sloEngine, incidentManager } from '../observability/index.js';
import { IntegrationRegistry } from '../integrations/registry/IntegrationRegistry.js';
import { IntegrationMode } from '../integrations/core/IntegrationTypes.js';

const appConfig = loadConfig();

const app = express();
const PORT = appConfig.port;

let isDraining = false;
export function setDrainingState(draining: boolean) {
  isDraining = draining;
}
export function getDrainingState(): boolean {
  return isDraining;
}

import { RequestValidator } from '../security/RequestValidator.js';

// Express Security Headers
app.use((_req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(RequestValidator.validatePayload());
app.use(validateSecurityInputs);

// ----------------------------------------------------
// PUBLIC API ENDPOINTS (No Authentication Required)
// ----------------------------------------------------

// Health Check Endpoint (Liveness)
app.get('/api/v1/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({
    status: isDraining ? 'DRAINING' : 'ok',
    service: 'ResolveX Autonomous Agent Engine Backend',
    version: appConfig.version,
    timestamp: new Date().toISOString(),
  });
});

// Readiness Check Endpoint (Readiness)
app.get('/api/v1/health/readiness', async (_req: Request, res: Response) => {
  const coordinator = ExecutionCoordinator.getInstance();
  const coordinatorReady = coordinator.isReady();

  if (isDraining || !coordinatorReady) {
    return res.status(503).json({
      status: 'SHUTTING_DOWN',
      readiness: false,
      service: 'ResolveX Autonomous Agent Engine Backend',
      timestamp: new Date().toISOString(),
    });
  }

  // Database Connectivity Probe
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (dbErr: any) {
    return res.status(503).json({
      status: 'DATABASE_UNAVAILABLE',
      readiness: false,
      service: 'ResolveX Autonomous Agent Engine Backend',
      error: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }

  return res.json({
    status: 'READY',
    readiness: true,
    service: 'ResolveX Autonomous Agent Engine Backend',
    version: appConfig.version,
    timestamp: new Date().toISOString(),
  });
});

// Integration Health Check Endpoint (Ops)
app.get('/api/v1/ops/integrations/health', (_req: Request, res: Response) => {
  const registry = IntegrationRegistry.getInstance();
  const mode = registry.getMode();
  const adapters = registry.getAllAdapters();
  const circuitBreakers = registry.getAllCircuitBreakers();

  const providerReports: Record<string, any> = {};
  let isDegraded = false;
  let isUnhealthy = false;

  adapters.forEach((adapter, type) => {
    const cb = circuitBreakers.get(adapter.providerName);
    const state = cb ? cb.getState() : 'CLOSED';
    if (state === 'OPEN') isUnhealthy = true;
    if (state === 'HALF_OPEN') isDegraded = true;

    providerReports[adapter.providerName] = {
      integrationType: type,
      providerName: adapter.providerName,
      circuitState: state,
      status: state === 'OPEN' ? 'UNHEALTHY' : state === 'HALF_OPEN' ? 'DEGRADED' : 'HEALTHY',
      lastChecked: new Date().toISOString()
    };
  });

  const overallStatus = isUnhealthy ? 'UNHEALTHY' : isDegraded ? 'DEGRADED' : 'HEALTHY';

  return res.json({
    overallStatus,
    mode,
    providers: providerReports,
    timestamp: new Date().toISOString()
  });
});

// Safe Build & Deployment Info Endpoint (No credentials or secret environment variables exposed)
app.get('/api/v1/info', (_req: Request, res: Response) => {
  const metadata = getRuntimeMetadata(appConfig.env, appConfig.version, appConfig.commitSha);
  res.json({
    success: true,
    info: metadata,
  });
});

// Root API Discovery Endpoint
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'ResolveX Secure API Gateway',
    status: isDraining ? 'draining' : 'online',
    securityMode: 'STRICT_RBAC_TENANT_ISOLATED',
    endpoints: {
      health: '/api/v1/health',
      readiness: '/api/v1/health/readiness',
      info: '/api/v1/info',
      cases: '/api/v1/cases',
      customers: '/api/v1/customers/:id',
      orders: '/api/v1/orders/:id',
      tickets: '/api/v1/tickets/:id',
      agentRuns: '/api/v1/agent-runs/:id',
      tools: '/api/v1/tools',
      agentRun: '/api/v1/agents/run',
      agentApprove: '/api/v1/agents/runs/:id/approve',
      agentConsent: '/api/v1/agents/runs/:id/consent',
      metrics: '/api/v1/metrics',
      slo: '/api/v1/ops/slo',
      incidents: '/api/v1/ops/incidents',
    },
  });
});

// ----------------------------------------------------
// PROTECTED DOMAIN ENTITY ENDPOINTS (Tenant & Customer Scoped)
// ----------------------------------------------------

// GET /api/v1/customers/:id
app.get('/api/v1/customers/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const customer = await DomainRepository.getCustomerById(req.params.id, principal.tenantId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Ownership check for CUSTOMER principal
    if (principal.role === 'CUSTOMER' && principal.customerId !== customer.id) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: customer.id,
        reason: 'Customer attempted to access another customer profile',
      });
      return res.status(404).json({ error: 'Customer not found' }); // Hide existence
    }

    return res.json(customer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/orders/:id
app.get('/api/v1/orders/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const order = await DomainRepository.getOrderById(req.params.id, principal.tenantId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Ownership check for CUSTOMER principal
    if (principal.role === 'CUSTOMER' && principal.customerId !== order.customerId) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: order.id,
        reason: 'Customer attempted to access another customer order',
      });
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/tickets/:id
app.get('/api/v1/tickets/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const ticket = await DomainRepository.getTicketById(req.params.id, principal.tenantId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Ownership check for CUSTOMER principal
    if (principal.role === 'CUSTOMER' && principal.customerId !== ticket.customerId) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: ticket.id,
        reason: 'Customer attempted to access another customer ticket',
      });
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.json(ticket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agent-runs/:id & Alias GET /api/v1/agents/runs/:id
app.get(['/api/v1/agent-runs/:id', '/api/v1/agents/runs/:id'], authenticate, async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const run = await AgentStateRepository.getAgentRun(req.params.id);

    if (!run) {
      return res.status(404).json({ error: 'Agent run not found' });
    }

    // Tenant boundary check
    if (run.tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: run.id,
        reason: `Cross-tenant access attempted on run (Run tenant: ${run.tenantId}, Caller tenant: ${principal.tenantId})`,
      });
      return res.status(404).json({ error: 'Agent run not found' });
    }

    // Ownership check for CUSTOMER principal
    if (principal.role === 'CUSTOMER' && run.ticket?.customerId && principal.customerId !== run.ticket.customerId) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: run.id,
        reason: 'Customer attempted to inspect another customer agent run',
      });
      return res.status(404).json({ error: 'Agent run not found' });
    }

    return res.json(run);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agents/runs/:id/execution
app.get('/api/v1/agents/runs/:id/execution', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const runId = req.params.id;

    const run = await AgentStateRepository.getAgentRun(runId);
    if (!run) {
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    if (run.tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    if (principal.role === 'CUSTOMER' && run.ticket?.customerId && principal.customerId !== run.ticket.customerId) {
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    const executionJob = await ExecutionRepository.getJobByAgentRunId(runId, principal.role === 'ADMIN' ? undefined : principal.tenantId);
    return res.json({ success: true, executionJob });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROTECTED TOOL API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/tools', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), (_req: Request, res: Response) => {
  res.json({
    tools: ToolRegistry.getAvailableTools(),
  });
});

app.get('/api/v1/tools/customers/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.getCustomer(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

app.get('/api/v1/tools/customers/:id/history', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.getCustomerHistory(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

app.get('/api/v1/tools/orders/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.getOrder(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

app.get('/api/v1/tools/products/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.getProduct(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

app.get('/api/v1/tools/inventory/:productId', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.checkInventory(req.params.productId);
  return res.status(result.success ? 200 : 404).json(result);
});

app.get('/api/v1/tools/tickets/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const result = await LookupTools.getTicket(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

app.post('/api/v1/tools/policy/check', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  const { issueType, actionType, context } = req.body;
  const result = await PolicyTools.checkPolicy(issueType, actionType, context);
  return res.json(result);
});

app.post('/api/v1/tools/refund', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { orderId, amount, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.issueRefund(orderId, amount, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/replacement', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { orderId, replacementProductId, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.createReplacement(orderId, replacementProductId, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/cancel', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { orderId, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.cancelOrder(orderId, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/coupon', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { customerId, couponCode, ticketId, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.applyCoupon(customerId, couponCode, ticketId, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/ticket/update', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { ticketId, status, resolutionType, agentRunId } = req.body;
  const result = await ActionTools.updateTicket(ticketId, status, resolutionType, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/ticket/escalate', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { ticketId, reason, priority, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.escalateTicket(ticketId, reason, priority, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/notification', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { ticketId, type, message, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.sendNotification(ticketId, type, message, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

app.post('/api/v1/tools/verify', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  const { actionId, agentRunId } = req.body;
  const result = await VerificationTools.verifyAction(actionId, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// ----------------------------------------------------
// PROTECTED AGENT PIPELINE ENDPOINTS
// ----------------------------------------------------

app.post('/api/v1/agents/intent/analyze', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { ticketId, customerId, orderId, message, agentRunId } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Customer message is required for intent analysis' });
    }

    const intent = await IntentAgent.analyze({
      ticketId,
      customerId,
      orderId,
      message,
      agentRunId,
    });

    return res.json({ success: true, intent });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/agents/investigation/run', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { intent, ticketId, customerId, orderId, message, agentRunId } = req.body;

    let targetIntent = intent;
    if (!targetIntent) {
      if (!message) {
        return res.status(400).json({ error: 'Either intent object or customer message is required for investigation' });
      }
      targetIntent = await IntentAgent.analyze({ ticketId, customerId, orderId, message, agentRunId });
    }

    const investigationResult = await InvestigationAgent.investigate({
      intent: targetIntent,
      ticketId,
      customerId,
      orderId,
      agentRunId,
    });

    return res.json({ success: true, investigationResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/agents/policy/evaluate', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { investigationResult, ticketId, customerId, orderId, message, agentRunId } = req.body;

    let targetInvestigation = investigationResult;
    if (!targetInvestigation) {
      if (!message && !ticketId) {
        return res.status(400).json({ error: 'Either investigationResult or (message/ticketId) is required' });
      }
      const intent = await IntentAgent.analyze({ ticketId, customerId, orderId, message: message || '', agentRunId });
      targetInvestigation = await InvestigationAgent.investigate({ intent, ticketId, customerId, orderId, agentRunId });
    }

    const policyEvaluation = await PolicyEngine.evaluate(targetInvestigation, { agentRunId });
    return res.json({ success: true, policyEvaluation });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/agents/decision/run', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const { investigationResult, policyEvaluation, ticketId, customerId, orderId, message, agentRunId } = req.body;

    let targetInvestigation = investigationResult;
    if (!targetInvestigation) {
      if (!message && !ticketId) {
        return res.status(400).json({ error: 'Either investigationResult or (message/ticketId) is required' });
      }
      const intent = await IntentAgent.analyze({ ticketId, customerId, orderId, message: message || '', agentRunId });
      targetInvestigation = await InvestigationAgent.investigate({ intent, ticketId, customerId, orderId, agentRunId });
    }

    let targetPolicyEval = policyEvaluation;
    if (!targetPolicyEval) {
      targetPolicyEval = await PolicyEngine.evaluate(targetInvestigation, { agentRunId });
    }

    const decisionResult = await DecisionEngine.decide(targetInvestigation, targetPolicyEval, { agentRunId });
    return res.json({ success: true, decisionResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/agents/action/execute', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const {
      decisionResult,
      investigationResult,
      ticketId,
      customerId,
      orderId,
      message,
      agentRunId,
      idempotencyKey,
      approvalToken,
      customerConsentGiven,
    } = req.body;

    let targetInvestigation = investigationResult;
    if (!targetInvestigation) {
      if (!message && !ticketId) {
        return res.status(400).json({ error: 'Either (decisionResult + investigationResult) or (message/ticketId) is required' });
      }
      const intent = await IntentAgent.analyze({ ticketId, customerId, orderId, message: message || '', agentRunId });
      targetInvestigation = await InvestigationAgent.investigate({ intent, ticketId, customerId, orderId, agentRunId });
    }

    let targetDecision = decisionResult;
    if (!targetDecision) {
      const policyEval = await PolicyEngine.evaluate(targetInvestigation, { agentRunId });
      targetDecision = await DecisionEngine.decide(targetInvestigation, policyEval, { agentRunId });
    }

    const executionResult = await ActionExecutor.execute(targetDecision, targetInvestigation, {
      agentRunId,
      idempotencyKey,
      approvalToken,
      customerConsentGiven,
    });

    return res.json({ success: true, executionResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/agents/recovery/replan', authenticate, requireRole(['SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const {
      executionResult,
      investigationResult,
      decisionResult,
      ticketId,
      customerId,
      orderId,
      message,
      agentRunId,
      replanCount,
      approvalToken,
      customerConsentGiven,
    } = req.body;

    let targetExecution = executionResult;
    let targetInvestigation = investigationResult;
    let targetDecision = decisionResult;

    if (!targetExecution || !targetInvestigation) {
      if (!message && !ticketId) {
        return res.status(400).json({
          error: 'Either executionResult + investigationResult or (message/ticketId) is required for failure recovery replanning',
        });
      }
      const intent = await IntentAgent.analyze({ ticketId, customerId, orderId, message: message || '', agentRunId });
      targetInvestigation = await InvestigationAgent.investigate({ intent, ticketId, customerId, orderId, agentRunId });
      const policyEval = await PolicyEngine.evaluate(targetInvestigation, { agentRunId });
      targetDecision = await DecisionEngine.decide(targetInvestigation, policyEval, { agentRunId });
      targetExecution = await ActionExecutor.execute(targetDecision, targetInvestigation, {
        agentRunId,
        approvalToken,
        customerConsentGiven,
      });
    }

    const replanResult = await FailureRecoveryAgent.replan({
      executionResult: targetExecution,
      investigationResult: targetInvestigation,
      decisionResult: targetDecision,
      options: {
        agentRunId,
        replanCount,
        approvalToken,
        customerConsentGiven,
      },
    });

    return res.json({ success: true, replanResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROTECTED ORCHESTRATION ENDPOINT
// ----------------------------------------------------

// POST /api/v1/agents/run  &  POST /api/v1/agents/runs (alias)
app.post(['/api/v1/agents/run', '/api/v1/agents/runs'], authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const {
      ticketId,
      customerId,
      orderId,
      message,
      agentRunId,
      approvalToken,
      customerConsentGiven,
      idempotencyKey,
      correlationId,
      maxLoops,
    } = req.body;

    // Enforce customer ownership for CUSTOMER principal
    let targetCustomerId = customerId;
    if (principal.role === 'CUSTOMER') {
      if (customerId && customerId !== principal.customerId) {
        SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
          correlationId: correlationId || req.correlationId,
          principalId: principal.id,
          role: principal.role,
          tenantId: principal.tenantId,
          reason: 'Customer specified a customerId different from authenticated identity',
        });
        return res.status(403).json({ error: 'Forbidden: Cannot create run for another customer identity.' });
      }
      targetCustomerId = principal.customerId;
    }

    const isAsync = req.query.async === 'true';

    // If async background execution requested, enqueue and return 202 Accepted
    if (isAsync) {
      const run = await AgentStateRepository.createAgentRun({
        ticketId,
        goal: message || 'Autonomous customer resolution',
        tenantId: principal.tenantId,
        correlationId: correlationId || req.correlationId,
      });

      const enqueueResult = await ExecutionCoordinator.getInstance().enqueueRun({
        agentRunId: run.id,
        tenantId: principal.tenantId,
        correlationId: correlationId || req.correlationId,
        syncExecute: false,
      });

      return res.status(202).json({
        success: true,
        queued: true,
        agentRunId: run.id,
        executionJob: enqueueResult.job,
      });
    }

    // Default synchronous execution
    const orchestrationResult = await AgentOrchestrator.run({
      ticketId,
      customerId: targetCustomerId,
      orderId,
      message,
      agentRunId,
      approvalToken,
      customerConsentGiven,
      idempotencyKey,
      correlationId,
      maxLoops,
      tenantId: principal.tenantId,
    });

    if (orchestrationResult?.agentRunId) {
      await ExecutionRepository.createJob({
        agentRunId: orchestrationResult.agentRunId,
        tenantId: principal.tenantId,
        correlationId: orchestrationResult.correlationId || correlationId || req.correlationId,
      }).then(async (job) => {
        if (['WAITING_FOR_APPROVAL', 'WAITING_FOR_CUSTOMER_CONSENT'].includes(orchestrationResult.status)) {
          await ExecutionRepository.markWaiting(job.id);
        } else {
          await ExecutionRepository.markCompleted(job.id);
        }
      }).catch(() => null);
    }

    return res.json({ success: true, orchestrationResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROTECTED HUMAN APPROVAL & CONSENT GATES
// ----------------------------------------------------

// POST /api/v1/agents/runs/:id/approve & /api/v1/agents/runs/:id/approval
app.post(['/api/v1/agents/runs/:id/approve', '/api/v1/agents/runs/:id/approval'], authenticate, requireRole(['APPROVER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const runId = req.params.id;
    const { decision, reason } = req.body;

    SecurityLogger.logEvent('APPROVAL_ATTEMPT', {
      correlationId: req.correlationId,
      principalId: principal.id,
      role: principal.role,
      tenantId: principal.tenantId,
      targetResourceId: runId,
    });

    const run = await AgentStateRepository.getAgentRun(runId);
    if (!run) {
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    // Tenant isolation check
    if (run.tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: runId,
        reason: 'Approver attempted to approve run belonging to another tenant',
      });
      return res.status(404).json({ error: `Agent run '${runId}' not found` }); // Hide existence
    }

    if (run.status === 'RESOLVED' || run.status === 'COMPLETED') {
      return res.status(409).json({ error: `Cannot approve an already resolved/completed run '${runId}'` });
    }

    // Generate authenticated signed approval token from principal
    const validApprovalToken = AuthService.generateToken(principal);

    const orchestrationResult = await ExecutionCoordinator.getInstance().resumeRun({
      agentRunId: runId,
      tenantId: principal.tenantId,
      correlationId: req.correlationId,
      syncExecute: true,
      resumeInput: {
        agentRunId: runId,
        decision: decision || 'APPROVE',
        approvalToken: validApprovalToken,
        reason,
      },
    });

    return res.json({ success: true, orchestrationResult });
  } catch (error: any) {
    const status = error.message?.includes('AGENT_RUN_NOT_FOUND')
      ? 404
      : error.message?.includes('INVALID_STATE')
      ? 409
      : 500;
    return res.status(status).json({ error: error.message });
  }
});

// POST /api/v1/agents/runs/:id/consent
app.post('/api/v1/agents/runs/:id/consent', authenticate, requireRole(['CUSTOMER', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const runId = req.params.id;
    const { consentGiven, decision, reason } = req.body;

    SecurityLogger.logEvent('CONSENT_ATTEMPT', {
      correlationId: req.correlationId,
      principalId: principal.id,
      role: principal.role,
      tenantId: principal.tenantId,
      targetResourceId: runId,
    });

    const run = await AgentStateRepository.getAgentRun(runId);
    if (!run) {
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    // Tenant isolation check
    if (run.tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: runId,
        reason: 'Customer attempted to provide consent for run belonging to another tenant',
      });
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    // Customer ownership check
    if (principal.role === 'CUSTOMER' && run.ticket?.customerId && principal.customerId !== run.ticket.customerId) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: runId,
        reason: 'Customer attempted to provide consent for another customer run',
      });
      return res.status(404).json({ error: `Agent run '${runId}' not found` });
    }

    if (run.status === 'RESOLVED' || run.status === 'COMPLETED') {
      return res.status(409).json({ error: `Cannot provide consent for an already resolved/completed run '${runId}'` });
    }

    const isGranted = consentGiven !== false && decision !== 'DENY';
    const orchestrationResult = await ExecutionCoordinator.getInstance().resumeRun({
      agentRunId: runId,
      tenantId: principal.tenantId,
      correlationId: req.correlationId,
      syncExecute: true,
      resumeInput: {
        agentRunId: runId,
        decision: isGranted ? 'GRANT' : 'DENY',
        customerConsentGiven: isGranted,
        reason,
      },
    });

    return res.json({ success: true, orchestrationResult });
  } catch (error: any) {
    const status = error.message?.includes('AGENT_RUN_NOT_FOUND')
      ? 404
      : error.message?.includes('INVALID_STATE')
      ? 409
      : 500;
    return res.status(status).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROTECTED OPERATOR CONTROL PLANE ENDPOINTS
// ----------------------------------------------------

// GET /api/v1/ops/runs
app.get('/api/v1/ops/runs', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), requireTenantIsolation, async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const { status, currentStep, correlationId, ticketId, orderId, staleOnly, limit, offset } = req.query;

    const runs = await AgentStateRepository.listOperatorRuns({
      status: status as string,
      currentStep: currentStep as string,
      correlationId: correlationId as string,
      ticketId: ticketId as string,
      orderId: orderId as string,
      tenantId: principal.role === 'ADMIN' ? undefined : principal.tenantId,
      staleOnly: staleOnly === 'true',
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    return res.json({ success: true, count: runs.length, total: runs.length, runs });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/ops/health/runs (MUST be placed before /:id to prevent route shadowing)
app.get('/api/v1/ops/health/runs', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const report = await AgentStateRepository.getHealthAndStaleRunsReport(
      principal.role === 'ADMIN' ? undefined : principal.tenantId
    );
    return res.json({ success: true, report, healthReport: report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/ops/execution/status
app.get('/api/v1/ops/execution/status', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const coordinator = ExecutionCoordinator.getInstance();
    const metrics = await coordinator.getMetrics(principal.role === 'ADMIN' ? undefined : principal.tenantId);

    return res.json({
      success: true,
      workerId: coordinator.getWorkerId(),
      metrics,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/ops/runs/:id
app.get('/api/v1/ops/runs/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const runId = req.params.id;

    const detail = await AgentStateRepository.getOperatorRunDetail(runId);
    if (!detail) {
      return res.status(404).json({ error: `Operator run detail for '${runId}' not found`, code: 'VALIDATION_ERROR' });
    }

    // Tenant check
    if ((detail as any).tenantId && (detail as any).tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: runId,
        reason: 'Operator attempted to inspect run belonging to another tenant',
      });
      return res.status(404).json({ error: `Operator run detail for '${runId}' not found`, code: 'VALIDATION_ERROR' });
    }

    return res.json({ success: true, run: detail, runDetail: detail });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});

// POST /api/v1/ops/runs/:id/reconcile
app.post('/api/v1/ops/runs/:id/reconcile', authenticate, requireRole(['OPERATOR', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const runId = req.params.id;

    const run = await AgentStateRepository.getAgentRun(runId);
    if (!run) {
      return res.status(404).json({ error: `Agent run '${runId}' not found for reconciliation`, code: 'VALIDATION_ERROR' });
    }

    if (run.tenantId !== principal.tenantId && principal.role !== 'ADMIN') {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: runId,
        reason: 'Operator attempted to reconcile run belonging to another tenant',
      });
      return res.status(404).json({ error: `Agent run '${runId}' not found for reconciliation`, code: 'VALIDATION_ERROR' });
    }

    const result = await AgentStateRepository.reconcileAgentRun(runId);
    return res.json({ success: true, reconciliation: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});

// GET /api/v1/evaluation/latest (Phase 15 Evaluation Report API)
app.get('/api/v1/evaluation/latest', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (_req: Request, res: Response) => {
  try {
    let report = EvaluationRunner.getLatestReport();
    if (!report) {
      report = await EvaluationRunner.runEvaluation(undefined, { runDeterminism: false });
    }
    return res.json({ success: true, report });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, code: 'INTERNAL_ERROR' });
  }
});


// ----------------------------------------------------
// CUSTOMER NOTIFICATION ENDPOINTS
// ----------------------------------------------------

// GET /api/v1/notifications — List own in-app notifications
app.get('/api/v1/notifications', authenticate, requireRole(['CUSTOMER', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const { unreadOnly, limit, offset } = req.query;

    const customerId = principal.customerId;
    if (!customerId) {
      return res.status(403).json({ error: 'Forbidden: Only customer principals can list notifications.', correlationId: req.correlationId });
    }

    const notifications = await NotificationRepository.findByCustomer(customerId, principal.tenantId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit as string, 10) : 50,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    const unreadCount = await NotificationRepository.countUnread(customerId, principal.tenantId);

    return res.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});


// GET /api/v1/notifications/:id — Get single notification (customer-owned)
app.get('/api/v1/notifications/:id', authenticate, requireRole(['CUSTOMER', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const notification = await NotificationRepository.findById(req.params.id, principal.tenantId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Ownership check for CUSTOMER principal
    if (principal.role === 'CUSTOMER') {
      if (notification.customerId !== principal.customerId && notification.recipient !== principal.customerId) {
        SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
          correlationId: req.correlationId,
          principalId: principal.id,
          role: principal.role,
          tenantId: principal.tenantId,
          targetResourceId: notification.id,
          reason: 'Customer attempted to access another customer notification',
        });
        return res.status(404).json({ error: 'Notification not found' });
      }
    }

    return res.json({ success: true, notification });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/notifications/:id/read — Mark notification as read
app.post('/api/v1/notifications/:id/read', authenticate, requireRole(['CUSTOMER', 'SERVICE', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const customerId = principal.customerId || principal.id;

    const updated = await NotificationRepository.markRead(req.params.id, customerId, principal.tenantId);

    if (!updated) {
      SecurityLogger.logEvent('CROSS_TENANT_ACCESS_DENIED', {
        correlationId: req.correlationId,
        principalId: principal.id,
        role: principal.role,
        tenantId: principal.tenantId,
        targetResourceId: req.params.id,
        reason: 'Customer attempted to mark another customer notification as read',
      });
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true, notification: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// OPERATOR NOTIFICATION ENDPOINTS
// ----------------------------------------------------

// GET /api/v1/ops/notifications/metrics — Delivery metrics (must be before /:id)
app.get('/api/v1/ops/notifications/metrics', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = principal.role === 'ADMIN' ? undefined : principal.tenantId;
    const metrics = await NotificationRepository.getMetrics(tenantId);
    return res.json({ success: true, metrics });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/ops/notifications — List tenant notifications (operator view)
app.get('/api/v1/ops/notifications', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const { status, eventType, recipientType, limit, offset } = req.query;
    const tenantId = principal.role === 'ADMIN' ? undefined : principal.tenantId;

    const notifications = await NotificationRepository.findForOperator(tenantId || principal.tenantId, {
      status: status as string,
      eventType: eventType as string,
      recipientType: recipientType as string,
      limit: limit ? parseInt(limit as string, 10) : 100,
      offset: offset ? parseInt(offset as string, 10) : 0,
    });

    const metrics = await NotificationRepository.getMetrics(tenantId);
    return res.json({ success: true, count: notifications.length, notifications, metrics });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/ops/notifications/:id — Single notification detail (operator view)
app.get('/api/v1/ops/notifications/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = principal.role === 'ADMIN' ? undefined : principal.tenantId;
    const notification = await NotificationRepository.findById(req.params.id, tenantId || principal.tenantId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.json({ success: true, notification });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/ops/notifications/:id/retry — Retry failed notification (operator)
// NOTE: Only retries the notification delivery — does NOT re-run the AgentRun or business mutation.
app.post('/api/v1/ops/notifications/:id/retry', authenticate, requireRole(['OPERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = principal.role === 'ADMIN' ? undefined : principal.tenantId;

    const updated = await NotificationRepository.retryFailed(req.params.id, tenantId || principal.tenantId, principal.id);

    if (!updated || (updated as any).error) {
      return res.status(400).json({ error: (updated as any)?.error || 'Notification retry failed — not found or not in FAILED state' });
    }

    // Re-dispatch the queued notification
    if (updated.status === 'QUEUED') {
      NotificationDispatcher.dispatch(updated.eventType as any, {
        agentRunId: updated.agentRunId || undefined,
        ticketId: updated.ticketId || undefined,
        customerId: updated.customerId || undefined,
        tenantId: updated.tenantId,
        correlationId: updated.correlationId || undefined,
      }, [updated.channel as any]).catch(() => null);
    }

    return res.json({ success: true, notification: updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});
// ----------------------------------------------------
// PHASE 20 — POLICY GOVERNANCE, VERSIONING & CHANGE CONTROL ENDPOINTS
// ----------------------------------------------------

// GET /api/v1/policies — List policies for caller's tenant
app.get('/api/v1/policies', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = principal.role === 'ADMIN' && req.query.tenantId ? (req.query.tenantId as string) : principal.tenantId;
    const policies = await PolicyRepository.listPolicies(tenantId);
    const metrics = await PolicyRepository.getMetrics(tenantId);
    return res.json({ success: true, policies, metrics });
  } catch (error: any) {
    if (!res.headersSent) {
      return res.status(500).json({ error: error.message });
    }
  }
});

// GET /api/v1/policies/:id — Get policy detail with version history
app.get('/api/v1/policies/:id', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;

    const policy = await PolicyRepository.getPolicyWithVersions(policyId, principal.tenantId);
    if (!policy) {
      return res.status(404).json({ error: `Policy '${policyId}' not found` });
    }

    return res.json({ success: true, policy });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// GET /api/v1/policies/:id/versions — List all versions for a policy
app.get('/api/v1/policies/:id/versions', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;

    const policy = await PolicyRepository.getPolicyWithVersions(policyId, principal.tenantId);
    if (!policy) {
      return res.status(404).json({ error: `Policy '${policyId}' not found` });
    }

    return res.json({ success: true, policyId, versions: policy.versions || [] });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// GET /api/v1/policies/:id/versions/:version — Get single version detail
app.get('/api/v1/policies/:id/versions/:version', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);

    const policy = await PolicyRepository.getPolicyWithVersions(policyId, principal.tenantId);
    if (!policy) {
      return res.status(404).json({ error: `Policy '${policyId}' not found` });
    }

    const version = policy.versions?.find((v) => v.version === versionNum);
    if (!version) {
      return res.status(404).json({ error: `Policy version ${versionNum} not found for policy '${policyId}'` });
    }

    return res.json({ success: true, version });
  } catch (error: any) {
    return res.status(404).json({ error: error.message });
  }
});

// GET /api/v1/policies/:id/diff — Structured diff between two versions
app.get('/api/v1/policies/:id/diff', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const v1 = req.query.v1 ? parseInt(req.query.v1 as string, 10) : 1;
    const v2 = req.query.v2 ? parseInt(req.query.v2 as string, 10) : 2;

    const diff = await PolicyRepository.computeDiff(policyId, v1, v2, principal.tenantId);
    return res.json({ success: true, diff });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies — Create new Policy (ADMIN only)
app.post('/api/v1/policies', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const { policyKey, name, description, issueType, actionType, conditions, approvalRequired, priority, autoActivate } = req.body;

    const result = await PolicyRepository.createPolicy({
      tenantId: principal.tenantId,
      policyKey,
      name,
      description,
      issueType,
      actionType,
      conditions: conditions || {},
      approvalRequired,
      priority,
      createdBy: principal.id,
      autoActivate: autoActivate === true,
    });

    return res.status(201).json({ success: true, policy: result.policy, version: result.version });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions — Create next DRAFT version (ADMIN only)
app.post('/api/v1/policies/:id/versions', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const { name, issueType, actionType, conditions, approvalRequired, priority, changeSummary, effectiveFrom, effectiveUntil } = req.body;

    const version = await PolicyRepository.createVersion({
      policyId,
      name,
      issueType,
      actionType,
      conditions,
      approvalRequired,
      priority,
      changeSummary,
      effectiveFrom,
      effectiveUntil,
      createdBy: principal.id,
    }, principal.tenantId);

    return res.status(201).json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/submit — Submit DRAFT → PENDING_APPROVAL (ADMIN only)
app.post('/api/v1/policies/:id/versions/:version/submit', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);

    const version = await PolicyRepository.submitVersion(policyId, versionNum, principal.tenantId, principal.id);
    return res.json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/approve — Approve PENDING_APPROVAL → APPROVED (APPROVER, ADMIN)
app.post('/api/v1/policies/:id/versions/:version/approve', authenticate, requireRole(['APPROVER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);
    const { allowSelfApprove } = req.body || {};

    const version = await PolicyRepository.approveVersion(policyId, versionNum, principal.tenantId, principal.id, principal.role, allowSelfApprove === true);
    return res.json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/activate — Activate APPROVED → ACTIVE (ADMIN, SERVICE)
app.post('/api/v1/policies/:id/versions/:version/activate', authenticate, requireRole(['ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);

    const version = await PolicyRepository.activateVersion(policyId, versionNum, principal.tenantId, principal.id);
    return res.json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/retire — Retire ACTIVE/APPROVED → RETIRED (ADMIN only)
app.post('/api/v1/policies/:id/versions/:version/retire', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);

    const version = await PolicyRepository.retireVersion(policyId, versionNum, principal.tenantId, principal.id);
    return res.json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/rollback — Rollback to previous version (ADMIN only)
app.post('/api/v1/policies/:id/versions/:version/rollback', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const policyId = req.params.id;
    const targetVersionNum = parseInt(req.params.version, 10);

    const version = await PolicyRepository.rollbackPolicy(policyId, targetVersionNum, principal.tenantId, principal.id);
    return res.json({ success: true, version });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/v1/policies/:id/versions/:version/evaluate — Dry-run / Preview evaluation against sample context (Non-mutating)
app.post('/api/v1/policies/:id/versions/:version/evaluate', authenticate, requireRole(['OPERATOR', 'APPROVER', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const tenantId = req.principal!.tenantId;
    const policyId = req.params.id;
    const versionNum = parseInt(req.params.version, 10);
    const caseContext = req.body.caseContext || req.body.investigationContext || {};

    const result = await PolicyEngine.evaluatePreview({
      tenantId,
      policyId,
      versionNum,
      caseContext,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(400).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PHASE 21 — ADVANCED CASE MANAGEMENT ENDPOINTS
// ----------------------------------------------------

// GET /api/v1/cases — List customer or tenant cases with search & pagination
app.get('/api/v1/cases', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const customerId = principal.role === 'CUSTOMER' ? (principal.customerId || principal.id) : (req.query.customerId as string);

    const result = await caseRepository.listCases({
      tenantId: principal.tenantId,
      customerId,
      status: req.query.status as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to query cases' });
  }
});

// GET /api/v1/cases/:id — Fetch detailed case information (Tenant Isolated & IDOR Protected)
app.get('/api/v1/cases/:id', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const caseId = req.params.id;
    const customerId = principal.role === 'CUSTOMER' ? (principal.customerId || principal.id) : undefined;

    const caseDetail = await caseRepository.getCaseById(caseId, principal.tenantId, customerId);
    if (!caseDetail) {
      return res.status(404).json({ error: 'Case not found or access denied' });
    }

    return res.json({
      success: true,
      case: caseDetail,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch case detail' });
  }
});

// GET /api/v1/cases/:id/timeline — Fetch customer-safe or operator-complete case timeline
app.get('/api/v1/cases/:id/timeline', authenticate, requireRole(['CUSTOMER', 'OPERATOR', 'APPROVER', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const caseId = req.params.id;
    const isOperator = principal.role !== 'CUSTOMER';
    const customerId = principal.role === 'CUSTOMER' ? (principal.customerId || principal.id) : undefined;

    const timeline = await caseRepository.getCaseTimeline(caseId, principal.tenantId, customerId, isOperator);
    if (!timeline) {
      return res.status(404).json({ error: 'Case not found or access denied' });
    }

    return res.json({
      success: true,
      timeline,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch case timeline' });
  }
});

// ----------------------------------------------------
// OBSERVABILITY, SLO & INCIDENT MANAGEMENT ENDPOINTS (Phase 23)
// ----------------------------------------------------

// GET /api/v1/metrics — Prometheus text exposition format
app.get('/api/v1/metrics', authenticate, requireRole(['OPERATOR', 'ADMIN', 'SERVICE']), async (_req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', metricsRegistry.getContentType());
    const metricsOutput = await metricsRegistry.metrics();
    return res.status(200).send(metricsOutput);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to export metrics' });
  }
});

// GET /api/v1/ops/slo — SLO status, error budgets & burn rates
app.get('/api/v1/ops/slo', authenticate, requireRole(['OPERATOR', 'ADMIN', 'SERVICE']), async (_req: Request, res: Response) => {
  try {
    const slos = sloEngine.evaluateSLOs();
    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      slos,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to evaluate SLOs' });
  }
});

// GET /api/v1/ops/incidents — List active/historical operational incidents
app.get('/api/v1/ops/incidents', authenticate, requireRole(['OPERATOR', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const status = req.query.status as string | undefined;
    const severity = req.query.severity as string | undefined;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE')
      ? (req.query.tenantId as string | undefined)
      : principal.tenantId;

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await incidentManager.listIncidents({
      status: status as any,
      severity: severity as any,
      tenantId,
      page,
      limit,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to list incidents' });
  }
});

// GET /api/v1/ops/incidents/:id — Fetch detailed incident record
app.get('/api/v1/ops/incidents/:id', authenticate, requireRole(['OPERATOR', 'ADMIN', 'SERVICE']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const incident = await incidentManager.getIncidentById(req.params.id, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    // Tenant isolation check unless global admin/service
    if (principal.role !== 'ADMIN' && principal.role !== 'SERVICE' && incident.tenantScope && incident.tenantScope !== principal.tenantId) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch incident' });
  }
});

// POST /api/v1/ops/incidents/:id/acknowledge — Acknowledge an incident
app.post('/api/v1/ops/incidents/:id/acknowledge', authenticate, requireRole(['OPERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const actor = principal.id;
    const incident = await incidentManager.acknowledgeIncident(req.params.id, actor, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to acknowledge incident' });
  }
});

// POST /api/v1/ops/incidents/:id/investigate — Investigate an incident
app.post('/api/v1/ops/incidents/:id/investigate', authenticate, requireRole(['OPERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const actor = principal.id;
    const { note } = req.body || {};

    const incident = await incidentManager.investigateIncident(req.params.id, actor, note, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to investigate incident' });
  }
});

// POST /api/v1/ops/incidents/:id/mitigate — Mitigate an incident
app.post('/api/v1/ops/incidents/:id/mitigate', authenticate, requireRole(['OPERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const actor = principal.id;
    const { note } = req.body || {};

    const incident = await incidentManager.mitigateIncident(req.params.id, actor, note, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to mitigate incident' });
  }
});

// POST /api/v1/ops/incidents/:id/resolve — Resolve an incident
app.post('/api/v1/ops/incidents/:id/resolve', authenticate, requireRole(['OPERATOR', 'ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const actor = principal.id;
    const { resolutionSummary } = req.body || {};

    const incident = await incidentManager.resolveIncident(req.params.id, actor, resolutionSummary, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to resolve incident' });
  }
});

// POST /api/v1/ops/incidents/:id/close — Close an incident
app.post('/api/v1/ops/incidents/:id/close', authenticate, requireRole(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const principal = req.principal!;
    const tenantId = (principal.role === 'ADMIN' || principal.role === 'SERVICE') ? undefined : principal.tenantId;
    const actor = principal.id;
    const incident = await incidentManager.closeIncident(req.params.id, actor, tenantId);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({
      success: true,
      incident,
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to close incident' });
  }
});

// Catch-All 404 JSON Handler (must be before global error handler)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Not Found: The requested endpoint does not exist.',
  });
});

// Global Error Handler Middleware — Sanitizes Stack Traces & Internal Error Leakage
app.use((err: any, req: Request, res: Response, _next: any) => {
  const correlationId = (req as any).correlationId || 'N/A';
  SecurityLogger.logEvent('UNHANDLED_ERROR', {
    correlationId,
    reason: err?.message,
    route: req.path,
    method: req.method
  });

  const statusCode = err?.status || err?.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error: An unexpected error occurred.' 
      : (err?.message || 'Internal Server Error'),
    correlationId
  });
});

let serverInstance: any = null;

if (process.env.NODE_ENV !== 'test' && !process.env.VITEST) {
  serverInstance = app.listen(PORT, () => {
    console.log(`🚀 [ResolveX Backend] Server listening on http://localhost:${PORT}`);
  });
}

export const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 [ResolveX Backend] Received ${signal} signal. Initiating graceful shutdown...`);
  setDrainingState(true);

  // Set hard fallback timer for shutdown grace period
  const timer = setTimeout(() => {
    console.error(`⚠️ [ResolveX Backend] Graceful shutdown timeout reached (${appConfig.shutdownGraceMs}ms). Forcing exit.`);
    process.exit(1);
  }, appConfig.shutdownGraceMs);

  try {
    await ExecutionCoordinator.getInstance().shutdown();
    await prisma.$disconnect();

    if (serverInstance) {
      serverInstance.close(() => {
        console.log('✅ [ResolveX Backend] HTTP server & DB connections closed cleanly.');
        clearTimeout(timer);
        process.exit(0);
      });
    } else {
      clearTimeout(timer);
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    clearTimeout(timer);
    process.exit(1);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default app;
