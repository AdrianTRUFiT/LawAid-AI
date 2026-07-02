import type {
  PaiSafeDecision,
  PaiSafeRiskCode
} from "./contracts.js";
import type {
  PaiSafeConsumerProjection,
  PaiSafeInternalReviewProjection,
  PaiSafeMerchantProjection,
  PaiSafeNextStep,
  PaiSafeProofStatus,
  PaiSafeProjectableCircuit,
  PaiSafeReasonCategory,
  PaiSafeRoleStateProjection,
  PaiSafeTimelineItem
} from "./projectionContracts.js";

export function projectPaiSafeTransactionState(
  circuit: PaiSafeProjectableCircuit
): PaiSafeRoleStateProjection {
  const timeline = buildTimeline(circuit);
  const reasonCategory = deriveReasonCategory(circuit.trustCheck.riskCodes);
  const proofBackStatus = deriveProofStatus(circuit.trustCheck.decision);

  const merchant = projectMerchantState(circuit, timeline, reasonCategory, proofBackStatus);
  const consumer = projectConsumerState(circuit, timeline, reasonCategory);
  const internalReview = projectInternalReviewState(circuit, timeline, reasonCategory);

  return {
    transactionId: circuit.request.transactionId,
    decision: circuit.trustCheck.decision,
    merchant,
    consumer,
    internalReview
  };
}

function projectMerchantState(
  circuit: PaiSafeProjectableCircuit,
  timeline: PaiSafeTimelineItem[],
  reasonCategory: PaiSafeReasonCategory,
  proofBackStatus: PaiSafeProofStatus
): PaiSafeMerchantProjection {
  const decision = circuit.trustCheck.decision;

  return {
    role: "MERCHANT",
    transactionId: circuit.request.transactionId,
    transactionStatus: decision,
    fulfillmentReadiness: circuit.receipt.merchantView.fulfillmentReadiness,
    proofBackStatus,
    receiptAvailable: true,
    proofAvailable: true,
    reasonCategory,
    disputeSupportStatus: circuit.receipt.merchantView.disputeSupportStatus,
    nextStep: merchantNextStep(decision),
    timeline: timeline.filter((item) => item.visibleTo.includes("MERCHANT")),
    permissions: {
      canFulfill: decision === "SAFE",
      canRequestReview: decision === "HOLD",
      canViewInternalRiskCodes: false,
      canViewProofRecord: true,
      canViewReceipt: true
    }
  };
}

function projectConsumerState(
  circuit: PaiSafeProjectableCircuit,
  timeline: PaiSafeTimelineItem[],
  reasonCategory: PaiSafeReasonCategory
): PaiSafeConsumerProjection {
  const decision = circuit.trustCheck.decision;

  return {
    role: "CONSUMER",
    transactionId: circuit.request.transactionId,
    safePayStatus: decision,
    receiptAvailable: true,
    proofAvailable: true,
    userMessage: circuit.receipt.consumerView.message,
    reasonCategory,
    nextStep: consumerNextStep(decision),
    timeline: timeline.filter((item) => item.visibleTo.includes("CONSUMER")),
    permissions: {
      canPayWithConfidence: decision === "SAFE",
      canViewMerchantRiskInternals: false,
      canViewInternalRiskCodes: false,
      canViewReceipt: true,
      canViewProofStatus: true
    }
  };
}

function projectInternalReviewState(
  circuit: PaiSafeProjectableCircuit,
  timeline: PaiSafeTimelineItem[],
  reasonCategory: PaiSafeReasonCategory
): PaiSafeInternalReviewProjection {
  const proofBackConsistent =
    circuit.proofBack.transactionId === circuit.trustCheck.transactionId &&
    circuit.proofBack.decision === circuit.trustCheck.decision &&
    circuit.proofBack.requestHash === circuit.trustCheck.requestHash &&
    circuit.proofBack.decisionHash === circuit.trustCheck.decisionHash;

  const receiptConsistent =
    circuit.receipt.transactionId === circuit.trustCheck.transactionId &&
    circuit.receipt.proofBackId === circuit.proofBack.proofBackId &&
    circuit.receipt.requestHash === circuit.trustCheck.requestHash &&
    circuit.receipt.decisionHash === circuit.trustCheck.decisionHash &&
    circuit.receipt.recordHash === circuit.proofBack.recordHash &&
    circuit.receipt.merchantView.transactionStatus === circuit.trustCheck.decision &&
    circuit.receipt.consumerView.safePayStatus === circuit.trustCheck.decision;

  return {
    role: "INTERNAL_REVIEW",
    transactionId: circuit.request.transactionId,
    trustDecision: circuit.trustCheck.decision,
    riskCodes: circuit.trustCheck.riskCodes,
    reviewRequired: circuit.trustCheck.reviewRequired,
    reasonCategory,
    requestHash: circuit.trustCheck.requestHash,
    decisionHash: circuit.trustCheck.decisionHash,
    recordHash: circuit.proofBack.recordHash,
    receiptHash: circuit.receipt.receiptHash,
    proofBack: circuit.proofBack,
    receipt: circuit.receipt,
    receiptConsistent,
    proofBackConsistent,
    timeline: timeline.filter((item) => item.visibleTo.includes("INTERNAL_REVIEW")),
    nextStep: internalNextStep(circuit.trustCheck.decision),
    permissions: {
      canViewFullRiskCodes: true,
      canViewProofRecord: true,
      canViewReceipt: true,
      canAuthorizePayment: false,
      canWriteCustody: false,
      canPromoteDoctrine: false
    }
  };
}

function buildTimeline(circuit: PaiSafeProjectableCircuit): PaiSafeTimelineItem[] {
  return [
    {
      label: "Transaction request created",
      at: circuit.request.createdAt,
      visibleTo: ["MERCHANT", "CONSUMER", "INTERNAL_REVIEW"]
    },
    {
      label: "Advisory trust check completed",
      at: circuit.trustCheck.checkedAt,
      visibleTo: ["MERCHANT", "CONSUMER", "INTERNAL_REVIEW"]
    },
    {
      label: "ProofBack Protection record generated",
      at: circuit.proofBack.generatedAt,
      visibleTo: ["MERCHANT", "CONSUMER", "INTERNAL_REVIEW"]
    },
    {
      label: "Proof-backed receipt issued",
      at: circuit.receipt.issuedAt,
      visibleTo: ["MERCHANT", "CONSUMER", "INTERNAL_REVIEW"]
    },
    {
      label: "Internal consistency hashes available",
      at: circuit.receipt.issuedAt,
      visibleTo: ["INTERNAL_REVIEW"]
    }
  ];
}

function deriveProofStatus(decision: PaiSafeDecision): PaiSafeProofStatus {
  if (decision === "SAFE") return "PROOF_AVAILABLE";
  if (decision === "HOLD") return "REVIEW_RECORD_AVAILABLE";
  return "REFUSAL_RECORD_AVAILABLE";
}

function merchantNextStep(decision: PaiSafeDecision): PaiSafeNextStep {
  if (decision === "SAFE") return "FULFILL_WITH_CONFIDENCE";
  if (decision === "HOLD") return "WAIT_FOR_REVIEW";
  return "DO_NOT_FULFILL";
}

function consumerNextStep(decision: PaiSafeDecision): PaiSafeNextStep {
  if (decision === "SAFE") return "PAYMENT_CAN_PROCEED_WITH_PROOF";
  if (decision === "HOLD") return "WAIT_FOR_MERCHANT_OR_SYSTEM_REVIEW";
  return "TRANSACTION_REFUSED_DO_NOT_PAY";
}

function internalNextStep(decision: PaiSafeDecision): PaiSafeNextStep {
  if (decision === "SAFE") return "INTERNAL_REVIEW_NOT_REQUIRED";
  if (decision === "HOLD") return "INTERNAL_REVIEW_REQUIRED";
  return "INTERNAL_REFUSAL_RECORD_REQUIRED";
}

function deriveReasonCategory(riskCodes: PaiSafeRiskCode[]): PaiSafeReasonCategory {
  if (riskCodes.includes("NO_BLOCKING_RISK")) return "NONE";

  if (
    riskCodes.includes("DESTINATION_MISMATCH") ||
    riskCodes.includes("MERCHANT_DESTINATION_MISMATCH") ||
    riskCodes.includes("INVALID_DESTINATION_FORMAT") ||
    riskCodes.includes("CONFLICTING_TRANSACTION_ROUTING") ||
    riskCodes.includes("UNSUPPORTED_DESTINATION_TYPE")
  ) {
    return "DESTINATION_INTEGRITY";
  }

  if (
    riskCodes.includes("MISSING_MERCHANT_IDENTITY") ||
    riskCodes.includes("INVALID_MERCHANT_IDENTITY") ||
    riskCodes.includes("INCOMPLETE_MERCHANT_PROFILE") ||
    riskCodes.includes("UNKNOWN_VENDOR") ||
    riskCodes.includes("UNKNOWN_PROCESSOR_ACCOUNT") ||
    riskCodes.includes("MERCHANT_RISK_CONTRADICTION")
  ) {
    return "MERCHANT_INTEGRITY";
  }

  if (
    riskCodes.includes("MISSING_TERMS") ||
    riskCodes.includes("MISSING_REFUND_POLICY") ||
    riskCodes.includes("CONSUMER_ACK_MISSING") ||
    riskCodes.includes("INCOMPLETE_TRANSACTION_ACKNOWLEDGMENT") ||
    riskCodes.includes("CONTRADICTORY_TRANSACTION_CONSENT")
  ) {
    return "CONSUMER_AGREEMENT";
  }

  if (
    riskCodes.includes("MALFORMED_TRANSACTION_REQUEST") ||
    riskCodes.includes("MISSING_REQUIRED_FIELDS") ||
    riskCodes.includes("INVALID_TRANSACTION_STRUCTURE")
  ) {
    return "STRUCTURAL_INTEGRITY";
  }

  if (
    riskCodes.includes("DUPLICATE_TRANSACTION_ATTEMPT") ||
    riskCodes.includes("CONFLICTING_TRANSACTION_METADATA") ||
    riskCodes.includes("HIGH_CONTRADICTION_RISK")
  ) {
    return "DUPLICATE_OR_CONFLICT";
  }

  if (riskCodes.includes("MULTIPLE_RISK_COMBINATION")) {
    return "MULTIPLE_RISK";
  }

  return "REVIEW_REQUIRED";
}