import { AIRequest, AIResponse, AIContext } from '../types/AITypes';

export interface AIProvider {
  readonly providerName: string;
  readonly modelName: string;

  generate<T = Record<string, unknown>>(
    request: AIRequest<unknown>,
    context: AIContext
  ): Promise<AIResponse<T>>;
}
