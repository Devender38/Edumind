import { AISchemas, ValidationResult } from '../schemas/AISchemas';
import { IntentLLMOutput, CustomerResponseLLMOutput } from '../types/AITypes';
import { DomainRepository } from '../../db/repositories/domainRepository';

export class OutputValidator {
  /**
   * Validates and verifies Intent LLM output.
   * Checks schema correctness and verifies that extracted entities (orderId, customerId) actually belong to caller tenant.
   */
  public static async validateAndVerifyIntent(
    rawJson: string | unknown,
    callerTenantId: string
  ): Promise<ValidationResult<IntentLLMOutput>> {
    let parsed: unknown = rawJson;
    if (typeof rawJson === 'string') {
      try {
        parsed = JSON.parse(rawJson);
      } catch (err) {
        return { valid: false, errors: ['LLM output is not valid JSON'] };
      }
    }

    const schemaResult = AISchemas.validateIntentOutput(parsed);
    if (!schemaResult.valid || !schemaResult.data) {
      return schemaResult;
    }

    const data = schemaResult.data;

    // Ground-Truth Entity Verification: Verify orderId belongs to tenant
    if (data.entities.orderId) {
      const order = await DomainRepository.getOrderById(data.entities.orderId, callerTenantId).catch(() => null);
      if (!order) {
        // Untrusted orderId claim rejected by ground truth!
        data.entities.orderId = undefined;
        data.ambiguity = true;
        data.confidence = Math.min(data.confidence, 0.4);
      }
    }

    // Ground-Truth Entity Verification: Verify customerId belongs to tenant
    if (data.entities.customerId) {
      const customer = await DomainRepository.getCustomerById(data.entities.customerId, callerTenantId).catch(() => null);
      if (!customer) {
        data.entities.customerId = undefined;
        data.ambiguity = true;
        data.confidence = Math.min(data.confidence, 0.4);
      }
    }

    return { valid: true, data, errors: [] };
  }

  /**
   * Validates Customer Response LLM output to guarantee no false completion claims or secret disclosures.
   */
  public static validateCustomerResponse(
    rawJson: string | unknown,
    verifiedStatus?: string
  ): ValidationResult<CustomerResponseLLMOutput> {
    let parsed: unknown = rawJson;
    if (typeof rawJson === 'string') {
      try {
        parsed = JSON.parse(rawJson);
      } catch (err) {
        return { valid: false, errors: ['Response LLM output is not valid JSON'] };
      }
    }

    const schemaResult = AISchemas.validateResponseOutput(parsed);
    if (!schemaResult.valid || !schemaResult.data) {
      return schemaResult;
    }

    const data = schemaResult.data;
    const errors: string[] = [];
    const textLower = data.message.toLowerCase();

    // Prevent unsupported claims (e.g. claiming refund was completed when status is not COMPLETED/RESOLVED)
    if (textLower.includes('refund') && (textLower.includes('completed') || textLower.includes('issued') || textLower.includes('sent') || textLower.includes('has been'))) {
      if (verifiedStatus !== 'COMPLETED' && verifiedStatus !== 'RESOLVED') {
        errors.push(`Unauthorized claim: Response claims refund completed, but verified state is '${verifiedStatus || 'UNVERIFIED'}'`);
      }
    }

    if (textLower.includes('has been cancelled') || textLower.includes('cancellation completed')) {
      if (verifiedStatus !== 'CANCELLED' && verifiedStatus !== 'RESOLVED') {
        errors.push(`Unauthorized claim: Response claims order cancelled, but verified state is '${verifiedStatus || 'UNVERIFIED'}'`);
      }
    }

    // Prevent prompt or credential leakage in customer message
    if (textLower.includes('system prompt') || textLower.includes('chain of thought') || textLower.includes('approvaltoken') || textLower.includes('secret_key')) {
      errors.push('Security violation: Customer response contains internal secret or system prompt leakage');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data, errors: [] };
  }
}
