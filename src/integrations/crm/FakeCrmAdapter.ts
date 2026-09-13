import { CrmAdapter, CrmCommand, CrmResourceData } from './CrmAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { generateIdempotencyKey, redactSensitiveData } from '../core/IntegrationContext';

export class FakeCrmAdapter implements CrmAdapter {
  public readonly integrationType = IntegrationType.CRM;
  public readonly providerName = 'fake-crm-provider';

  private tickets: Map<string, CrmResourceData> = new Map();
  private executedIdempotencyKeys: Map<string, IntegrationResult<CrmResourceData>> = new Map();
  public simulateFailure: boolean = false;
  public simulateTimeout: boolean = false;

  constructor() {
    this.seedDefaults();
  }

  public seedDefaults() {
    this.tickets.set('TICKET-1001', {
      ticketId: 'TICKET-1001',
      customerId: 'CUST-001',
      subject: 'Order cancellation inquiry',
      description: 'Customer requested resolution for ORD-1001',
      status: 'OPEN',
      notes: ['Initial customer intake'],
      updatedAt: new Date().toISOString(),
      tenantId: 'tenant-default'
    });
  }

  async createTicket(customerId: string, subject: string, description: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>> {
    return this.execute({
      operationName: 'CREATE_TICKET',
      payload: { customerId, subject, description },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', note: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>> {
    return this.execute({
      operationName: 'UPDATE_TICKET',
      payload: { ticketId, status, note },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async getTicket(ticketId: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>> {
    return this.execute({
      operationName: 'GET_TICKET',
      payload: { ticketId },
      idempotencyKey: generateIdempotencyKey(context)
    }, context);
  }

  async execute(command: CrmCommand, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>> {
    const startTime = Date.now();
    const key = command.idempotencyKey || generateIdempotencyKey(context);

    if (this.executedIdempotencyKeys.has(key)) {
      const cached = this.executedIdempotencyKeys.get(key)!;
      return { ...cached, durationMs: Date.now() - startTime };
    }

    if (this.simulateTimeout) {
      const result: IntegrationResult<CrmResourceData> = {
        success: false,
        outcome: IntegrationOutcome.UNKNOWN_OUTCOME,
        idempotencyKey: key,
        error: { code: 'INTEGRATION_TIMEOUT', message: 'Simulated CRM API timeout', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (this.simulateFailure) {
      const result: IntegrationResult<CrmResourceData> = {
        success: false,
        outcome: IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: { code: 'CRM_SERVICE_ERROR', message: 'CRM endpoint unavailable', retryable: true },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    // Redact any sensitive internal data in payload
    const sanitizedPayload = redactSensitiveData(command.payload);

    if (command.operationName === 'GET_TICKET') {
      const ticketId = sanitizedPayload.ticketId || '';
      const match = this.tickets.get(ticketId);
      if (!match) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'TICKET_NOT_FOUND', message: `Ticket ${ticketId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: ticketId,
        idempotencyKey: key,
        data: { ...match },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }

    if (command.operationName === 'CREATE_TICKET') {
      const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const ticketData: CrmResourceData = {
        ticketId,
        customerId: sanitizedPayload.customerId || 'CUST-GENERIC',
        subject: sanitizedPayload.subject || 'Autonomous Resolution',
        description: sanitizedPayload.description || 'Auto-created resolution ticket',
        status: 'OPEN',
        notes: sanitizedPayload.note ? [sanitizedPayload.note] : [],
        updatedAt: new Date().toISOString(),
        tenantId: context.tenantId
      };

      this.tickets.set(ticketId, ticketData);

      const result: IntegrationResult<CrmResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: ticketId,
        idempotencyKey: key,
        data: ticketData,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    if (command.operationName === 'UPDATE_TICKET' || command.operationName === 'ADD_NOTE') {
      const ticketId = sanitizedPayload.ticketId || '';
      const existing = this.tickets.get(ticketId);
      if (!existing) {
        return {
          success: false,
          outcome: IntegrationOutcome.FAILED,
          idempotencyKey: key,
          error: { code: 'TICKET_NOT_FOUND', message: `Ticket ${ticketId} not found`, retryable: false },
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (sanitizedPayload.status) {
        existing.status = sanitizedPayload.status;
      }
      if (sanitizedPayload.note) {
        existing.notes.push(sanitizedPayload.note);
      }
      existing.updatedAt = new Date().toISOString();
      this.tickets.set(ticketId, existing);

      const result: IntegrationResult<CrmResourceData> = {
        success: true,
        outcome: IntegrationOutcome.SUCCESS,
        operationId: ticketId,
        idempotencyKey: key,
        data: existing,
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
      this.executedIdempotencyKeys.set(key, result);
      return result;
    }

    return {
      success: false,
      outcome: IntegrationOutcome.FAILED,
      idempotencyKey: key,
      error: { code: 'UNSUPPORTED_OPERATION', message: `Operation ${command.operationName} unsupported`, retryable: false },
      durationMs: Date.now() - startTime,
      provider: this.providerName,
      timestamp: new Date().toISOString()
    };
  }

  async verify(operation: CrmCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<CrmResourceData>> {
    const ticketId = operation.payload.ticketId;
    if (ticketId && this.tickets.has(ticketId)) {
      const match = this.tickets.get(ticketId)!;
      return {
        verified: true,
        resourceExists: true,
        currentState: match,
        matchesExpectedState: true,
        details: `Ticket ${ticketId} verified with status=${match.status}`,
        timestamp: new Date().toISOString()
      };
    }

    return {
      verified: true,
      resourceExists: true,
      matchesExpectedState: true,
      details: 'CRM verification completed',
      timestamp: new Date().toISOString()
    };
  }
}
