import { AIProvider } from './AIProvider';
import { FakeAIProvider } from './FakeAIProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { LocalLLMProvider } from './LocalLLMProvider';
import { AIProviderMode, AIProductionState } from '../types/AITypes';

export class AIProviderRegistry {
  private static instance: AIProviderRegistry;
  private providers: Map<string, AIProvider> = new Map();
  private currentMode: AIProviderMode = AIProviderMode.AI_SANDBOX;
  private activeProviderName: string = 'fake-ai-provider';

  private constructor() {
    this.initializeDefaultProviders();
  }

  public static getInstance(): AIProviderRegistry {
    if (!AIProviderRegistry.instance) {
      AIProviderRegistry.instance = new AIProviderRegistry();
    }
    return AIProviderRegistry.instance;
  }

  public setMode(mode: AIProviderMode): void {
    this.currentMode = mode;
    this.initializeDefaultProviders();
  }

  public getMode(): AIProviderMode {
    return this.currentMode;
  }

  public getProductionState(): AIProductionState {
    if (this.currentMode === AIProviderMode.AI_DISABLED || process.env.AI_ENABLED === 'false') {
      return AIProductionState.AI_DISABLED;
    }
    if (this.currentMode === AIProviderMode.AI_SANDBOX) {
      return AIProductionState.AI_SANDBOX;
    }
    if (this.currentMode === AIProviderMode.AI_LOCAL || this.activeProviderName === 'local-llm') {
      return AIProductionState.AI_PRODUCTION_CONFIGURED;
    }
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim() !== '' && !apiKey.includes('placeholder')) {
      return AIProductionState.AI_PRODUCTION_CONFIGURED;
    }
    return AIProductionState.AI_PRODUCTION_UNAVAILABLE;
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.providerName, provider);
  }

  public setActiveProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`AI Provider '${name}' is not registered`);
    }
    this.activeProviderName = name;
  }

  public getActiveProvider(): AIProvider {
    const provider = this.providers.get(this.activeProviderName);
    if (!provider) {
      throw new Error(`Active AI Provider '${this.activeProviderName}' not found`);
    }
    return provider;
  }

  public resetAll(): void {
    this.providers.clear();
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders(): void {
    const envMode = (process.env.AI_PROVIDER_MODE as AIProviderMode) || (process.env.AI_MODE as AIProviderMode) || this.currentMode;
    this.currentMode = envMode;

    const fake = new FakeAIProvider();
    const openai = new OpenAIProvider();
    const localLLM = new LocalLLMProvider();

    this.registerProvider(fake);
    this.registerProvider(openai);
    this.registerProvider(localLLM);

    if (this.currentMode === AIProviderMode.AI_PRODUCTION) {
      this.activeProviderName = 'openai';
    } else if (this.currentMode === AIProviderMode.AI_LOCAL || process.env.AI_PROVIDER === 'local-llm' || process.env.AI_PROVIDER === 'ollama') {
      this.activeProviderName = 'local-llm';
    } else {
      this.activeProviderName = 'fake-ai-provider';
    }
  }
}
