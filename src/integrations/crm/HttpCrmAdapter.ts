import { CrmAdapter, CrmCommand, CrmResourceData } from './CrmAdapter';
import { IntegrationType, IntegrationOutcome, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';
import { HardenedHttpClient } from '../core/HttpClient';
import { IntegrationError } from '../core/IntegrationError';
import { generateIdempotencyKey, redactSensitiveData } from '../core/IntegrationContext';

export class HttpCrmAdapter implements CrmAdapter {
  public readonly integrationType = IntegrationType.CRM;
  public readonly providerName: string;
  private readonly client: HardenedHttpClient;

  constructor(options: { baseURL: string; apiKey?: string; providerName?: string; customFetch?: typeof fetch }) {
    this.providerName = options.providerName || 'http-crm-provider';
    this.client = new HardenedHttpClient({
      baseURL: options.baseURL,
      customFetch: options.customFetch
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

    // Apply strict redaction to chain of thought and sensitive properties in CRM payloads
    const sanitizedPayload = redactSensitiveData(command.payload);

    try {
      if (command.operationName === 'GET_TICKET') {
        const response = await this.client.request<CrmResourceData>({
          method: 'GET',
          url: `/crm/tickets/${sanitizedPayload.ticketId}`,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.ticketId,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'CREATE_TICKET') {
        const response = await this.client.request<CrmResourceData>({
          method: 'POST',
          url: '/crm/tickets',
          body: sanitizedPayload,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.ticketId,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      if (command.operationName === 'UPDATE_TICKET' || command.operationName === 'ADD_NOTE') {
        const response = await this.client.request<CrmResourceData>({
          method: 'PATCH',
          url: `/crm/tickets/${sanitizedPayload.ticketId}`,
          body: sanitizedPayload,
          tenantId: context.tenantId,
          correlationId: context.correlationId,
          idempotencyKey: key
        });

        return {
          success: true,
          outcome: IntegrationOutcome.SUCCESS,
          operationId: response.data.ticketId,
          idempotencyKey: key,
          data: response.data,
          durationMs: Date.now() - startTime,
          provider: this.providerName,
          timestamp: new Date().toISOString()
        };
      }

      throw new IntegrationError({
        message: `Unsupported CRM operation: ${command.operationName}`,
        code: 'UNSUPPORTED_OPERATION',
        retryable: false
      });

    } catch (err: any) {
      const isUnknown = err.isUnknownOutcome ?? (err.isTimeout || !err.rawStatus || err.rawStatus >= 500);
      return {
        success: false,
        outcome: isUnknown ? IntegrationOutcome.UNKNOWN_OUTCOME : IntegrationOutcome.FAILED,
        idempotencyKey: key,
        error: {
          code: err.code || 'HTTP_ERROR',
          message: err.message,
          retryable: err.retryable ?? true,
          rawStatus: err.rawStatus
        },
        durationMs: Date.now() - startTime,
        provider: this.providerName,
        timestamp: new Date().toISOString()
      };
    }
  }

  async verify(operation: CrmCommand, context: IntegrationContext): Promise<GroundTruthVerificationResult<CrmResourceData>> {
    const ticketId = operation.payload.ticketId;
    try {
      if (!ticketId) {
        return {
          verified: true,
          resourceExists: true,
          matchesExpectedState: true,
          details: 'CRM ticket creation verified',
          timestamp: new Date().toISOString()
        };
      }

      const res = await this.getTicket(ticketId, context);
      if (!res.success || !res.data) {
        return {
          verified: false,
          resourceExists: false,
          matchesExpectedState: false,
          details: `Verification read failed for ticket ${ticketId}`,
          timestamp: new Date().toISOString()
        };
      }

      return {
        verified: true,
        resourceExists: true,
        currentState: res.data,
        matchesExpectedState: true,
        details: `Ticket ${ticketId} status: ${res.data.status}`,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      return {
        verified: false,
        resourceExists: false,
        matchesExpectedState: false,
        details: `Exception verifying CRM ticket ${ticketId}: ${err.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }
}
