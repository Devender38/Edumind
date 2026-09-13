/**
 * Circuit Breaker pattern implementation for external integrations.
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;    // Number of failures before opening (default: 5)
  resetTimeoutMs?: number;      // Time in OPEN state before testing HALF_OPEN (default: 10000)
  halfOpenSuccessThreshold?: number; // Successes in HALF_OPEN to close (default: 2)
}

export class CircuitBreaker {
  private readonly providerName: string;
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastStateChange: Date = new Date();
  private lastFailureTime: Date | null = null;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly halfOpenSuccessThreshold: number;

  constructor(providerName: string, options: CircuitBreakerOptions = {}) {
    this.providerName = providerName;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 10000;
    this.halfOpenSuccessThreshold = options.halfOpenSuccessThreshold ?? 2;
  }

  public getProviderName(): string {
    return this.providerName;
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN) {
      const elapsed = Date.now() - this.lastStateChange.getTime();
      if (elapsed >= this.resetTimeoutMs) {
        this.transitionTo(CircuitState.HALF_OPEN);
      }
    }
    return this.state;
  }

  public allowExecution(): boolean {
    const currentState = this.getState();
    return currentState !== CircuitState.OPEN;
  }

  public recordSuccess(): void {
    const currentState = this.getState();
    if (currentState === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.halfOpenSuccessThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    } else if (currentState === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  public recordFailure(): void {
    this.lastFailureTime = new Date();
    const currentState = this.getState();

    if (currentState === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (currentState === CircuitState.CLOSED) {
      this.failureCount++;
      if (this.failureCount >= this.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }
  }

  public forceState(newState: CircuitState): void {
    this.transitionTo(newState);
  }

  public getMetrics() {
    return {
      providerName: this.providerName,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastStateChange: this.lastStateChange,
      lastFailureTime: this.lastFailureTime
    };
  }

  private transitionTo(newState: CircuitState): void {
    this.state = newState;
    this.lastStateChange = new Date();

    if (newState === CircuitState.CLOSED) {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
  }
}
