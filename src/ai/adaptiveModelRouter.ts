/**
 * ResolveX Step 8 — Advisory Adaptive Model Router
 * 
 * Selects model/provider based on request complexity, provider availability, and budget state.
 * 
 * STRICT SAFETY BOUNDARY:
 * Model routing is ADVISORY ONLY. It NEVER decides authorization, refund eligibility,
 * payment mutation, customer consent, policy exceptions, or tenant access.
 */

import { AIResourceGovernance } from './aiResourceGovernance';

export interface ModelRoutingDecision {
  selectedProvider: 'local-llm' | 'openai' | 'deterministic-fallback';
  selectedModel: string;
  reasonCategory: 'SIMPLE_CLASSIFICATION' | 'COMPLEX_AMBIGUITY' | 'PROVIDER_FALLBACK' | 'BUDGET_EXHAUSTED';
  fallbackReason?: string;
  budgetState: 'AVAILABLE' | 'WARN' | 'EXHAUSTED';
  routingPolicyVersion: string;
}

export class AdaptiveModelRouter {
  private static instance: AdaptiveModelRouter;
  private static ROUTING_POLICY_VERSION = '2.0.0-adaptive';
  private history: any[] = [];

  private constructor() {}

  public static getInstance(): AdaptiveModelRouter {
    if (!AdaptiveModelRouter.instance) {
      AdaptiveModelRouter.instance = new AdaptiveModelRouter();
    }
    return AdaptiveModelRouter.instance;
  }

  public static resetInstance(): void {
    AdaptiveModelRouter.instance = new AdaptiveModelRouter();
  }

  public reset(): void {
    this.history = [];
  }

  public getAuthorityLevel(): string {
    return 'ADVISORY_ONLY';
  }

  public getSupportedModels(): string[] {
    return ['llama-3-8b', 'llama-3-70b', 'gpt-4o-mini', 'gpt-4o', 'llama3.2:latest'];
  }

  public getRoutingHistory(): any[] {
    return [...this.history];
  }

  public selectModel(params: {
    taskType: string;
    complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
    userOverrideModel?: string;
    tenantBudgetConstrained?: boolean;
    latencySensitivity?: 'NORMAL' | 'CRITICAL';
  }): {
    recommendedModel: string;
    tier: 'LIGHTWEIGHT' | 'BALANCED' | 'FULL_REASONING';
    authorityLevel: 'ADVISORY_ONLY';
    isOverride: boolean;
    canExecuteDirectly: boolean;
    reason: string;
    estimatedCostSavingsRatio: number;
  } {
    let model = 'llama-3-8b';
    let tier: 'LIGHTWEIGHT' | 'BALANCED' | 'FULL_REASONING' = 'LIGHTWEIGHT';
    let isOverride = false;
    let savingsRatio = 0.85;

    if (params.userOverrideModel) {
      model = params.userOverrideModel;
      isOverride = true;
      tier = model.includes('70b') || model.includes('4o') ? 'FULL_REASONING' : 'LIGHTWEIGHT';
    } else if (params.tenantBudgetConstrained) {
      model = 'llama-3-8b';
      tier = 'LIGHTWEIGHT';
      savingsRatio = 0.95;
    } else if (params.complexity === 'HIGH' || params.taskType === 'COMPLEX_INVESTIGATION') {
      model = 'llama-3-70b';
      tier = 'FULL_REASONING';
      savingsRatio = 0.10;
    } else if (params.latencySensitivity === 'CRITICAL' || params.complexity === 'LOW' || params.taskType === 'STATUS_LOOKUP') {
      model = 'llama-3-8b';
      tier = 'LIGHTWEIGHT';
      savingsRatio = 0.85;
    }

    const decision = {
      recommendedModel: model,
      tier,
      authorityLevel: 'ADVISORY_ONLY' as const,
      isOverride,
      canExecuteDirectly: false,
      reason: params.tenantBudgetConstrained ? 'Budget constrained fallback' : 'Optimal performance/cost route',
      estimatedCostSavingsRatio: savingsRatio
    };

    this.history.push({ params, decision, timestamp: Date.now() });
    return decision;
  }

  public static routeRequest(promptText: string, agentRunId: string, tenantId: string = 'tenant-a'): ModelRoutingDecision {
    const governance = AIResourceGovernance.getInstance();
    const budgetCheck = governance.checkBudgetAvailable(agentRunId, tenantId);

    if (!budgetCheck.allowed) {
      return {
        selectedProvider: 'deterministic-fallback',
        selectedModel: 'deterministic_rules_v1',
        reasonCategory: 'BUDGET_EXHAUSTED',
        fallbackReason: budgetCheck.reason || 'AI resource budget exceeded',
        budgetState: 'EXHAUSTED',
        routingPolicyVersion: this.ROUTING_POLICY_VERSION,
      };
    }

    const lowerPrompt = promptText.toLowerCase();

    // Complex ambiguity check (e.g. multi-issue, legal terms, extreme dissatisfaction)
    const isComplex = lowerPrompt.includes('dispute') ||
                      lowerPrompt.includes('attorney') ||
                      lowerPrompt.includes('consumer court') ||
                      (lowerPrompt.length > 500);

    if (isComplex) {
      return {
        selectedProvider: 'local-llm',
        selectedModel: 'llama3.2:latest',
        reasonCategory: 'COMPLEX_AMBIGUITY',
        budgetState: 'AVAILABLE',
        routingPolicyVersion: this.ROUTING_POLICY_VERSION,
      };
    }

    // Default fast & efficient classification route
    return {
      selectedProvider: 'local-llm',
      selectedModel: 'llama3.2:latest',
      reasonCategory: 'SIMPLE_CLASSIFICATION',
      budgetState: 'AVAILABLE',
      routingPolicyVersion: this.ROUTING_POLICY_VERSION,
    };
  }
}

