import {
  StructuredIntent,
  IssueType,
  RequestedResolution,
  IntentEntities,
} from '../../types/index.js';
import { AgentStateRepository } from '../../db/repositories/agentStateRepository.js';

export interface IntentAgentInput {
  ticketId?: string;
  customerId?: string;
  orderId?: string;
  message: string;
  agentRunId?: string;
}

export interface IntentClassifier {
  classify(input: IntentAgentInput): Promise<StructuredIntent>;
}

export class DeterministicIntentClassifier implements IntentClassifier {
  async classify(input: IntentAgentInput): Promise<StructuredIntent> {
    const text = input.message.toLowerCase();
    const missingInfo: string[] = [];

    // 1. Amount Extraction (e.g. ₹24,999 or Rs 24999 or 24,999)
    let amount: number | undefined = undefined;
    let currency: string | undefined = undefined;

    const rupeeMatch = input.message.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i) || input.message.match(/([\d,]+)\s*(?:rupees|inr)/i);
    if (rupeeMatch) {
      const parsed = parseFloat(rupeeMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed)) {
        amount = parsed;
        currency = 'INR';
      }
    } else {
      const numMatch = input.message.match(/([\d,]{4,})/);
      if (numMatch) {
        const parsed = parseFloat(numMatch[1].replace(/,/g, ''));
        if (!isNaN(parsed)) amount = parsed;
      }
    }

    // 2. Order ID Extraction (Strict matching: ord-xxx or explicit #ORD-xxx, NEVER hallucinated!)
    let orderId: string | undefined = input.orderId;
    const orderMatch = input.message.match(/\b(ord-[a-z0-9-]+)\b/i) || input.message.match(/order\s*#?\s*([a-z0-9-]+)/i);
    if (orderMatch) {
      orderId = orderMatch[1];
    }

    if (!orderId && !input.ticketId) {
      missingInfo.push('orderId');
    }

    // 3. Product Name Extraction
    let productName: string | undefined = undefined;
    if (text.includes('phone') || text.includes('smartphone') || text.includes('nexus')) {
      productName = 'Nexus Pro 5G Smartphone';
    } else if (text.includes('earbud') || text.includes('pods') || text.includes('audio')) {
      productName = 'Smart Audio Pods Pro';
    } else if (text.includes('tablet') || text.includes('ultratab')) {
      productName = 'UltraTab 10 Tablet';
    }

    // 4. Issue Type & Requested Resolution Classification
    let issueType: IssueType = 'UNKNOWN';
    let requestedResolution: RequestedResolution = 'UNKNOWN';
    let confidence = 0.95;
    let reasoning = '';

    if (text.includes('cancel') || text.includes("don't want") || text.includes('stop order')) {
      issueType = 'CANCELLATION_REQUEST';
      requestedResolution = 'CANCELLATION';
      reasoning = 'Customer requested order cancellation';
    } else if (text.includes('coupon') || text.includes('discount') || text.includes('voucher')) {
      issueType = 'COUPON_REQUEST';
      requestedResolution = 'COUPON';
      reasoning = 'Customer requested goodwill coupon or compensation';
    } else if (text.includes('damage') || text.includes('cracked') || text.includes('broken')) {
      issueType = 'DAMAGED_ITEM';
      reasoning = 'Customer reported item arrived damaged/cracked';
    } else if (text.includes('defective') || text.includes('not working') || text.includes('faulty')) {
      issueType = 'DEFECTIVE_ITEM';
      reasoning = 'Customer reported item is defective or malfunctioning';
    } else if (text.includes('missing') || text.includes('empty box')) {
      issueType = 'MISSING_ITEM';
      reasoning = 'Customer reported missing item';
    } else if (text.includes('wrong') || text.includes('different item')) {
      issueType = 'WRONG_ITEM';
      reasoning = 'Customer reported receiving wrong item';
    } else if (text.includes('late') || text.includes('delay') || text.includes("hasn't arrived") || text.includes('where is my package')) {
      issueType = 'LATE_DELIVERY';
      reasoning = 'Customer inquired about delivery delay/status';
    } else if (text.includes('problem') || text.includes('issue') || text.includes('help')) {
      issueType = 'GENERAL_SUPPORT';
      confidence = 0.4;
      reasoning = 'Ambiguous customer query requires additional classification details';
      missingInfo.push('specific_issue_details');
    } else {
      issueType = 'UNKNOWN';
      confidence = 0.1;
      reasoning = 'Unrecognized customer message intent';
      missingInfo.push('issue_clarification');
    }

    // Determine Requested Resolution if not set by issueType
    if (requestedResolution === 'UNKNOWN') {
      if (text.includes('refund') || text.includes('money back') || text.includes('pay back')) {
        requestedResolution = 'REFUND';
      } else if (text.includes('replace') || text.includes('replacement') || text.includes('new one') || text.includes('exchange')) {
        requestedResolution = 'REPLACEMENT';
      } else if (text.includes('cancel')) {
        requestedResolution = 'CANCELLATION';
      } else if (text.includes('coupon')) {
        requestedResolution = 'COUPON';
      } else if (issueType === 'LATE_DELIVERY' || text.includes('where is')) {
        requestedResolution = 'INFORMATION';
      } else {
        requestedResolution = 'NONE';
      }
    }

    // Urgency & Sentiment
    let urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';
    if (text.includes('urgent') || text.includes('immediately') || text.includes('asap')) {
      urgency = 'URGENT';
    } else if (amount && amount > 10000) {
      urgency = 'HIGH';
    }

    let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'FRUSTRATED' = 'NEUTRAL';
    if (text.includes('frustrated') || text.includes('angry') || text.includes('horrible') || text.includes('terrible')) {
      sentiment = 'FRUSTRATED';
    } else if (text.includes('damaged') || text.includes('refund') || text.includes('broken')) {
      sentiment = 'NEGATIVE';
    }

    const entities: IntentEntities = {
      customerId: input.customerId,
      orderId,
      productId: undefined,
      amount,
      currency,
      productName,
    };

    return {
      issueType,
      requestedResolution,
      entities,
      urgency,
      sentiment,
      confidence,
      reasoningSummary: reasoning,
      missingInformation: missingInfo,
    };
  }
}

export class IntentAgent {
  private static defaultClassifier: IntentClassifier = new DeterministicIntentClassifier();

  static async analyze(
    input: IntentAgentInput,
    customClassifier?: IntentClassifier
  ): Promise<StructuredIntent> {
    const classifier = customClassifier || this.defaultClassifier;
    const intent = await classifier.classify(input);

    // Persist AgentTrace if agentRunId is provided
    if (input.agentRunId) {
      await AgentStateRepository.appendTrace({
        agentRunId: input.agentRunId,
        step: 'INTENT_CLASSIFICATION',
        type: 'INTENT',
        title: 'Customer Intent Understanding',
        description: `Classified Issue: ${intent.issueType}, Resolution: ${intent.requestedResolution} (Confidence: ${(intent.confidence * 100).toFixed(0)}%)`,
        input: { message: input.message, ticketId: input.ticketId },
        output: intent,
      }).catch(() => null);
    }

    return intent;
  }
}
