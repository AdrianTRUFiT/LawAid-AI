import type {
  ActivatedTransactionState,
  ProcessorEvent,
  RefusalReason,
  TransactionIntent,
  VerificationDecision,
  VerifiedOpportunity,
} from "./types";
import {
  assessTransactionRisk,
  riskSignalsToRefusalReasons,
} from "./riskModel";

function nowIso(): string {
  return new Date().toISOString();
}

function buildTransactionId(opportunity: VerifiedOpportunity): string {
  return `tx_${opportunity.verifiedOpportunityId}`;
}

function calculateProcessorFees(amount: number): number {
  return Number((amount * 0.029 + 0.3).toFixed(2));
}

function calculatePlatformFees(amount: number): number {
  return Number((amount * 0.01).toFixed(2));
}

function buildEntitlement(
  opportunity: VerifiedOpportunity,
): Record<string, unknown> {
  return {
    productId: opportunity.productId,
    productName: opportunity.productName,
    offerId: opportunity.offerId ?? null,
    planId: opportunity.planId ?? null,
    destinationType: opportunity.destinationType,
  };
}

export function createTransactionIntent(
  opportunity: VerifiedOpportunity,
): TransactionIntent {
  const ts = nowIso();

  return {
    transactionId: buildTransactionId(opportunity),
    verifiedOpportunity: opportunity,
    paymentStatus: "initiated",
    verificationStatus: "pending",
    createdAt: ts,
    updatedAt: ts,
  };
}

export function recordProcessorEvent(
  intent: TransactionIntent,
  event: ProcessorEvent,
): TransactionIntent {
  return {
    ...intent,
    paymentStatus: "processor-confirmed",
    updatedAt: event.receivedAt || nowIso(),
  };
}

export function verifyCommitment(
  intent: TransactionIntent,
  event: ProcessorEvent,
): VerificationDecision {
  const reasons: RefusalReason[] = [];

  if (!intent?.verifiedOpportunity) {
    reasons.push({
      code: "MISSING_OPPORTUNITY",
      message: "No verified opportunity was attached to this transaction intent.",
    });
  }

  if (!event.processorReference?.trim()) {
    reasons.push({
      code: "MISSING_PROCESSOR_REFERENCE",
      message: "Processor reference is required before verification can proceed.",
    });
  }

  if (intent.verifiedOpportunity.amount <= 0) {
    reasons.push({
      code: "INVALID_AMOUNT",
      message: "Verified opportunity amount must be greater than zero.",
      details: { amount: intent.verifiedOpportunity.amount },
    });
  }

  if (event.amount !== intent.verifiedOpportunity.amount) {
    reasons.push({
      code: "AMOUNT_MISMATCH",
      message: "Processor amount does not match the verified opportunity amount.",
      details: {
        expected: intent.verifiedOpportunity.amount,
        actual: event.amount,
      },
    });
  }

  if (event.currency !== intent.verifiedOpportunity.currency) {
    reasons.push({
      code: "CURRENCY_MISMATCH",
      message:
        "Processor currency does not match the verified opportunity currency.",
      details: {
        expected: intent.verifiedOpportunity.currency,
        actual: event.currency,
      },
    });
  }

  if (event.rawStatus !== "succeeded") {
    reasons.push({
      code: "UNSUPPORTED_STATUS",
      message: "Processor event status is not eligible for verification.",
      details: { rawStatus: event.rawStatus },
    });
  }

  if (reasons.length > 0) {
    return {
      allowed: false,
      paymentStatus: "held",
      verificationStatus: "held",
      reasons,
      evaluatedAt: nowIso(),
    };
  }

  const risk = assessTransactionRisk(intent, event);

  if (risk.recommendedAction === "refuse") {
    return {
      allowed: false,
      paymentStatus: "refused",
      verificationStatus: "refused",
      reasons: riskSignalsToRefusalReasons(risk),
      evaluatedAt: risk.evaluatedAt,
    };
  }

  if (risk.recommendedAction === "hold") {
    return {
      allowed: false,
      paymentStatus: "held",
      verificationStatus: "held",
      reasons: riskSignalsToRefusalReasons(risk),
      evaluatedAt: risk.evaluatedAt,
    };
  }

  return {
    allowed: true,
    paymentStatus: "verified",
    verificationStatus: "verified",
    reasons: [],
    evaluatedAt: risk.evaluatedAt,
  };
}

export function buildActivatedTransactionState(
  intent: TransactionIntent,
  event: ProcessorEvent,
  decision: VerificationDecision,
): ActivatedTransactionState {
  if (!decision.allowed) {
    throw new Error(
      `Cannot build ActivatedTransactionState from a non-allowed decision. Reasons: ${decision.reasons
        .map((r) => r.code)
        .join(", ")}`,
    );
  }

  const grossAmount = intent.verifiedOpportunity.amount;
  const processorFees = calculateProcessorFees(grossAmount);
  const platformFees = calculatePlatformFees(grossAmount);
  const netAmount = Number(
    (grossAmount - processorFees - platformFees).toFixed(2),
  );
  const ts = nowIso();

  return {
    transactionId: intent.transactionId,
    merchantId: intent.verifiedOpportunity.merchantId,
    customerId: intent.verifiedOpportunity.customerId,
    verifiedOpportunityId: intent.verifiedOpportunity.verifiedOpportunityId,
    processorReference: event.processorReference,
    paymentStatus: "verified",
    verificationStatus: "verified",
    grossAmount,
    processorFees,
    platformFees,
    netAmount,
    currency: intent.verifiedOpportunity.currency,
    entitlement: buildEntitlement(intent.verifiedOpportunity),
    activationPermission: true,
    destination: intent.verifiedOpportunity.destinationType,
    successRoute: intent.verifiedOpportunity.successRoute,
    cancelRoute: intent.verifiedOpportunity.cancelRoute,
    verifiedAt: decision.evaluatedAt,
    createdAt: intent.createdAt,
    updatedAt: ts,
    metadata: {
      ...intent.verifiedOpportunity.metadata,
      processorEventType: event.eventType,
      processorStatus: event.rawStatus,
      rail: event.metadata?.rail ?? null,
    },
  };
}

export function processVerifiedOpportunity(
  opportunity: VerifiedOpportunity,
  event: ProcessorEvent,
): {
  intent: TransactionIntent;
  decision: VerificationDecision;
  activatedTransactionState?: ActivatedTransactionState;
} {
  const intent = recordProcessorEvent(
    createTransactionIntent(opportunity),
    event,
  );
  const decision = verifyCommitment(intent, event);

  if (!decision.allowed) {
    return { intent, decision };
  }

  return {
    intent,
    decision,
    activatedTransactionState: buildActivatedTransactionState(
      intent,
      event,
      decision,
    ),
  };
}
