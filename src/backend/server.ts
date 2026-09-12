import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheckResponse } from '../types/index.js';
import { DomainRepository } from '../db/repositories/domainRepository.js';
import { AgentStateRepository } from '../db/repositories/agentStateRepository.js';

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
    },
  });
});

// GET /api/v1/customers/:id
app.get('/api/v1/customers/:id', async (req: Request, res: Response) => {
  try {
    const customer = await DomainRepository.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(customer);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/orders/:id
app.get('/api/v1/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await DomainRepository.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/tickets/:id
app.get('/api/v1/tickets/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await DomainRepository.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json(ticket);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/agent-runs/:id
app.get('/api/v1/agent-runs/:id', async (req: Request, res: Response) => {
  try {
    const run = await AgentStateRepository.getAgentRun(req.params.id);
    if (!run) {
      return res.status(404).json({ error: 'Agent run not found' });
    }
    return res.json(run);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [ResolveX Backend] Server listening on http://localhost:${PORT}`);
});

export default app;
