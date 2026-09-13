import { IntentLLMOutput, CustomerResponseLLMOutput } from '../types/AITypes';

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: string[];
}

export class AISchemas {
  /**
   * Validates structured intent LLM output.
   */
  public static validateIntentOutput(jsonObj: unknown): ValidationResult<IntentLLMOutput> {
    const errors: string[] = [];

    if (!jsonObj || typeof jsonObj !== 'object') {
      return { valid: false, errors: ['Output must be a non-null object'] };
    }

    const obj = jsonObj as Record<string, unknown>;

    let rawIntent = String(obj.primaryIntent || obj.intent || '').toUpperCase().trim();
    if (rawIntent.includes('REPLACEMENT')) rawIntent = 'REPLACEMENT';
    else if (rawIntent.includes('REFUND')) rawIntent = 'REFUND';
    else if (rawIntent.includes('CANCEL')) rawIntent = 'CANCELLATION';
    else if (rawIntent.includes('STATUS')) rawIntent = 'ORDER_STATUS';
    else if (rawIntent.includes('DAMAGED')) rawIntent = 'DAMAGED_ITEM';
    else if (rawIntent.includes('DEFECTIVE')) rawIntent = 'DEFECTIVE_ITEM';
    else if (rawIntent.includes('MISSING')) rawIntent = 'MISSING_ITEM';

    obj.intent = rawIntent;

    const validIntents = [
      'REFUND', 'REPLACEMENT', 'CANCELLATION', 'ORDER_STATUS',
      'SHIPPING', 'PAYMENT', 'DAMAGED_ITEM', 'DEFECTIVE_ITEM', 'MISSING_ITEM',
      'WRONG_ITEM', 'LATE_DELIVERY', 'COUPON', 'GENERAL_SUPPORT', 'UNKNOWN'
    ];

    if (typeof obj.intent !== 'string' || !validIntents.includes(obj.intent)) {
      errors.push(`Invalid intent: '${obj.intent}'. Must be one of: ${validIntents.join(', ')}`);
    }

    if (typeof obj.confidence !== 'number' || obj.confidence < 0 || obj.confidence > 1) {
      errors.push(`Confidence must be a number between 0 and 1. Got: ${obj.confidence}`);
    }

    if (typeof obj.ambiguity !== 'boolean') {
      errors.push(`Ambiguity must be a boolean. Got: ${typeof obj.ambiguity}`);
    }

    const entitiesObj = obj.entities || obj.entityHints;
    if (entitiesObj !== undefined && (typeof entitiesObj !== 'object' || entitiesObj === null)) {
      errors.push('Entities must be an object if provided');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const entities = (entitiesObj as Record<string, unknown>) || {};

    const cleanEntities = {
      orderId: typeof entities.orderId === 'string' ? entities.orderId : undefined,
      customerId: typeof entities.customerId === 'string' ? entities.customerId : undefined,
      productId: typeof entities.productId === 'string' ? entities.productId : undefined,
      productName: typeof entities.productName === 'string' ? entities.productName : undefined,
      amount: typeof entities.amount === 'number' ? entities.amount : undefined,
      currency: typeof entities.currency === 'string' ? entities.currency : undefined,
      reason: typeof entities.reason === 'string' ? entities.reason : undefined
    };

    const validData: IntentLLMOutput = {
      intent: obj.intent as IntentLLMOutput['intent'],
      confidence: obj.confidence as number,
      entities: cleanEntities,
      missingInformation: Array.isArray(obj.missingInformation) ? obj.missingInformation.filter((x): x is string => typeof x === 'string') : undefined,
      ambiguity: Boolean(obj.ambiguity),
      reasoning: typeof obj.reasoning === 'string' ? obj.reasoning : 'No reasoning provided'
    };

    return { valid: true, data: validData, errors: [] };
  }

  /**
   * Validates structured customer response LLM output.
   */
  public static validateResponseOutput(jsonObj: unknown): ValidationResult<CustomerResponseLLMOutput> {
    const errors: string[] = [];

    if (!jsonObj || typeof jsonObj !== 'object') {
      return { valid: false, errors: ['Output must be a non-null object'] };
    }

    const obj = jsonObj as Record<string, unknown>;

    if (typeof obj.message !== 'string' || obj.message.trim().length === 0) {
      errors.push('Message must be a non-empty string');
    }

    const validTones = ['EMPATHETIC', 'PROFESSIONAL', 'DIRECT', 'INFORMATIONAL'];
    if (typeof obj.tone !== 'string' || !validTones.includes(obj.tone)) {
      errors.push(`Tone must be one of: ${validTones.join(', ')}`);
    }

    if (!Array.isArray(obj.claims)) {
      errors.push('Claims must be an array of strings');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    const validData: CustomerResponseLLMOutput = {
      message: (obj.message as string).trim(),
      tone: obj.tone as CustomerResponseLLMOutput['tone'],
      claims: (obj.claims as unknown[]).map(c => String(c)),
      requiresClarification: Boolean(obj.requiresClarification)
    };

    return { valid: true, data: validData, errors: [] };
  }
}
