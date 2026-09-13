import { BaseIntegrationAdapter, IntegrationCommand, IntegrationContext, IntegrationResult, GroundTruthVerificationResult } from '../core/IntegrationTypes';

export interface CrmCommand extends IntegrationCommand {
  operationName: 'CREATE_TICKET' | 'UPDATE_TICKET' | 'ADD_NOTE' | 'GET_TICKET';
  payload: {
    ticketId?: string;
    customerId?: string;
    subject?: string;
    description?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    note?: string;
    chainOfThought?: string;
    internalMetadata?: Record<string, unknown>;
  };
}

export interface CrmResourceData {
  ticketId: string;
  customerId: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  notes: string[];
  updatedAt: string;
  tenantId: string;
}

export interface CrmAdapter extends BaseIntegrationAdapter<CrmCommand, CrmResourceData> {
  createTicket(customerId: string, subject: string, description: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>>;
  updateTicketStatus(ticketId: string, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED', note: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>>;
  getTicket(ticketId: string, context: IntegrationContext): Promise<IntegrationResult<CrmResourceData>>;
}
