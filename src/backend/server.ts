import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheckResponse } from '../types/index.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';
import { LookupTools, PolicyTools, ActionTools, VerificationTools, ToolRegistry } from '../tools/index.js';
import { IntentAgent, InvestigationAgent } from '../agents/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint (MUST NOT BREAK)
app.get('/api/v1/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({
    status: 'ok',
    service: 'ResolveX Autonomous Agent Engine Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root API Discovery Endpoint
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'ResolveX API Gateway',
    status: 'online',
    endpoints: {
      health: '/api/v1/health',
      customers: '/api/v1/customers/:id',
      orders: '/api/v1/orders/:id',
      tickets: '/api/v1/tickets/:id',
      agentRuns: '/api/v1/agent-runs/:id',
      tools: '/api/v1/tools',
      intentAnalyze: '/api/v1/agents/intent/analyze',
      investigationRun: '/api/v1/agents/investigation/run',
    },
  });
});

// Existing Read-Only Endpoint: GET /api/v1/customers/:id
app.get('/api/v1/customers/:id', async (req: Request, res: Response) => {
  try {
    const customer = await DomainRepository.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    return res.json(customer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Existing Read-Only Endpoint: GET /api/v1/orders/:id
app.get('/api/v1/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await DomainRepository.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Existing Read-Only Endpoint: GET /api/v1/tickets/:id
app.get('/api/v1/tickets/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await DomainRepository.getTicketById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.json(ticket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Existing Read-Only Endpoint: GET /api/v1/agent-runs/:id
app.get('/api/v1/agent-runs/:id', async (req: Request, res: Response) => {
  try {
    const run = await AgentStateRepository.getAgentRun(req.params.id);
    if (!run) return res.status(404).json({ error: 'Agent run not found' });
    return res.json(run);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PHASE 4: TOOL API ENDPOINTS (/api/v1/tools/...)
// ----------------------------------------------------

// List Available Tools
app.get('/api/v1/tools', (_req: Request, res: Response) => {
  res.json({
    tools: ToolRegistry.getAvailableTools(),
  });
});

// GET /api/v1/tools/customers/:id
app.get('/api/v1/tools/customers/:id', async (req: Request, res: Response) => {
  const result = await LookupTools.getCustomer(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

// GET /api/v1/tools/customers/:id/history
app.get('/api/v1/tools/customers/:id/history', async (req: Request, res: Response) => {
  const result = await LookupTools.getCustomerHistory(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

// GET /api/v1/tools/orders/:id
app.get('/api/v1/tools/orders/:id', async (req: Request, res: Response) => {
  const result = await LookupTools.getOrder(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

// GET /api/v1/tools/products/:id
app.get('/api/v1/tools/products/:id', async (req: Request, res: Response) => {
  const result = await LookupTools.getProduct(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

// GET /api/v1/tools/inventory/:productId
app.get('/api/v1/tools/inventory/:productId', async (req: Request, res: Response) => {
  const result = await LookupTools.checkInventory(req.params.productId);
  return res.status(result.success ? 200 : 404).json(result);
});

// GET /api/v1/tools/tickets/:id
app.get('/api/v1/tools/tickets/:id', async (req: Request, res: Response) => {
  const result = await LookupTools.getTicket(req.params.id);
  return res.status(result.success ? 200 : 404).json(result);
});

// POST /api/v1/tools/policy/check
app.post('/api/v1/tools/policy/check', async (req: Request, res: Response) => {
  const { issueType, actionType, context } = req.body;
  const result = await PolicyTools.checkPolicy(issueType, actionType, context);
  return res.json(result);
});

// POST /api/v1/tools/refund
app.post('/api/v1/tools/refund', async (req: Request, res: Response) => {
  const { orderId, amount, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.issueRefund(orderId, amount, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/replacement
app.post('/api/v1/tools/replacement', async (req: Request, res: Response) => {
  const { orderId, replacementProductId, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.createReplacement(orderId, replacementProductId, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/cancel
app.post('/api/v1/tools/cancel', async (req: Request, res: Response) => {
  const { orderId, reason, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.cancelOrder(orderId, reason, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/coupon
app.post('/api/v1/tools/coupon', async (req: Request, res: Response) => {
  const { customerId, couponCode, ticketId, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.applyCoupon(customerId, couponCode, ticketId, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/ticket/update
app.post('/api/v1/tools/ticket/update', async (req: Request, res: Response) => {
  const { ticketId, status, resolutionType, agentRunId } = req.body;
  const result = await ActionTools.updateTicket(ticketId, status, resolutionType, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/ticket/escalate
app.post('/api/v1/tools/ticket/escalate', async (req: Request, res: Response) => {
  const { ticketId, reason, priority, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.escalateTicket(ticketId, reason, priority, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/notification
app.post('/api/v1/tools/notification', async (req: Request, res: Response) => {
  const { ticketId, type, message, idempotencyKey, agentRunId } = req.body;
  const result = await ActionTools.sendNotification(ticketId, type, message, idempotencyKey, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// POST /api/v1/tools/verify
app.post('/api/v1/tools/verify', async (req: Request, res: Response) => {
  const { actionId, agentRunId } = req.body;
  const result = await VerificationTools.verifyAction(actionId, { agentRunId });
  return res.status(result.success ? 200 : 400).json(result);
});

// ----------------------------------------------------
// PHASE 5: AGENT ENDPOINTS (/api/v1/agents/...)
// ----------------------------------------------------

// POST /api/v1/agents/intent/analyze
app.post('/api/v1/agents/intent/analyze', async (req: Request, res: Response) => {
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

// POST /api/v1/agents/investigation/run
app.post('/api/v1/agents/investigation/run', async (req: Request, res: Response) => {
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

app.listen(PORT, () => {
  console.log(`🚀 [ResolveX Backend] Server listening on http://localhost:${PORT}`);
});

export default app;
