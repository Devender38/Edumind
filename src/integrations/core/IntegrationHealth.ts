import { CircuitState } from './CircuitBreaker';

export interface ProviderHealthReport {
  providerName: string;
  integrationType: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  circuitState: CircuitState;
  latencyMs?: number;
  lastChecked: string;
  message?: string;
}

export interface IntegrationHealthReport {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  mode: string;
  providers: Record<string, ProviderHealthReport>;
  timestamp: string;
}

export class IntegrationHealthManager {
  private static instance: IntegrationHealthManager;

  private constructor() {}

  public static getInstance(): IntegrationHealthManager {
    if (!IntegrationHealthManager.instance) {
      IntegrationHealthManager.instance = new IntegrationHealthManager();
    }
    return IntegrationHealthManager.instance;
  }
}
