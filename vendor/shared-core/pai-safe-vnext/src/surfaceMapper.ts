import type {
  PaiSafeDecision
} from "./contracts.js";

import type {
  PaiSafeRoleStateProjection,
  PaiSafeNextStep,
  PaiSafeReasonCategory
} from "./projectionContracts.js";

import type {
  PaiSafeBlockedAction,
  PaiSafeCopySafeLabels,
  PaiSafeDisplayDecisionLabel,
  PaiSafeDisplayFulfillmentLabel,
  PaiSafeDisplayProofLabel,
  PaiSafePublicAction,
  PaiSafeSurfaceContractPacket,
  PaiSafeSurfaceTone
} from "./surfaceContracts.js";

export function buildPaiSafeSurfaceContractPacket(
  projection: PaiSafeRoleStateProjection
): PaiSafeSurfaceContractPacket {
  const decision = projection.decision;

  return {
    transactionId: projection.transactionId,
    decision,
    merchantCard: {
      role: "MERCHANT_SURFACE",
      transactionId: projection.transactionId,
      decision,
      tone: toneForDecision(decision),
      labels: buildCopySafeLabels(decision, projection.merchant.reasonCategory, projection.merchant.nextStep),
      fulfillmentLabel: fulfillmentLabelForDecision(decision),
      proofAvailable: projection.merchant.proofAvailable,
      receiptAvailable: projection.merchant.receiptAvailable,
      reasonCategory: projection.merchant.reasonCategory,
      disputeSupportLabel: disputeSupportLabel(decision),
      allowedActions: merchantAllowedActions(decision),
      blockedActions: commonBlockedActions(),
      timelineLabels: projection.merchant.timeline.map((item) => item.label),
      sourceProjection: "MERCHANT_PROJECTION",
      readOnly: true
    },
    consumerReceiptView: {
      role: "CONSUMER_SURFACE",
      transactionId: projection.transactionId,
      decision,
      tone: toneForDecision(decision),
      labels: buildCopySafeLabels(decision, projection.consumer.reasonCategory, projection.consumer.nextStep),
      userMessage: projection.consumer.userMessage,
      proofAvailable: projection.consumer.proofAvailable,
      receiptAvailable: projection.consumer.receiptAvailable,
      reasonCategory: projection.consumer.reasonCategory,
      allowedActions: consumerAllowedActions(decision),
      blockedActions: commonBlockedActions(),
      timelineLabels: projection.consumer.timeline.map((item) => item.label),
      sourceProjection: "CONSUMER_PROJECTION",
      readOnly: true
    },
    internalReviewPacket: {
      role: "INTERNAL_REVIEW_SURFACE",
      transactionId: projection.transactionId,
      decision,
      tone: toneForDecision(decision),
      reasonCategory: projection.internalReview.reasonCategory,
      riskCodes: projection.internalReview.riskCodes,
      hashes: {
        requestHash: projection.internalReview.requestHash,
        decisionHash: projection.internalReview.decisionHash,
        recordHash: projection.internalReview.recordHash,
        receiptHash: projection.internalReview.receiptHash
      },
      consistency: {
        proofBackConsistent: projection.internalReview.proofBackConsistent,
        receiptConsistent: projection.internalReview.receiptConsistent
      },
      reviewRequired: projection.internalReview.reviewRequired,
      nextStep: projection.internalReview.nextStep,
      proofBackId: projection.internalReview.proofBack.proofBackId,
      receiptId: projection.internalReview.receipt.receiptId,
      allowedActions: internalAllowedActions(decision),
      blockedActions: [
        "AUTHORIZE_PAYMENT",
        "WRITE_CUSTODY",
        "PROMOTE_DOCTRINE",
        "MODIFY_TRUST_DECISION",
        "MODIFY_PROOF_RECORD"
      ],
      timelineLabels: projection.internalReview.timeline.map((item) => item.label),
      sourceProjection: "INTERNAL_REVIEW_PROJECTION",
      readOnly: true
    },
    hiddenFieldPolicy: {
      hiddenFromMerchant: [
        "riskCodes",
        "requestHash",
        "decisionHash",
        "recordHash",
        "receiptHash",
        "internalReviewPacket",
        "proofBack.rawRecord",
        "receipt.rawRecord"
      ],
      hiddenFromConsumer: [
        "riskCodes",
        "merchantRiskInternals",
        "requestHash",
        "decisionHash",
        "recordHash",
        "receiptHash",
        "internalReviewPacket",
        "proofBack.rawRecord",
        "receipt.rawRecord"
      ],
      internalOnly: [
        "riskCodes",
        "requestHash",
        "decisionHash",
        "recordHash",
        "receiptHash",
        "proofBackConsistency",
        "receiptConsistency",
        "internalTimeline"
      ]
    },
    stateToUiMapping: {
      circuit: "DECIDES",
      projection: "REFLECTS",
      surfaceContract: "MAPS",
      ui: "RENDERS_LATER"
    }
  };
}

function toneForDecision(decision: PaiSafeDecision): PaiSafeSurfaceTone {
  if (decision === "SAFE") return "success";
  if (decision === "HOLD") return "warning";
  return "danger";
}

function decisionLabel(decision: PaiSafeDecision): PaiSafeDisplayDecisionLabel {
  if (decision === "SAFE") return "Safe";
  if (decision === "HOLD") return "Held for Review";
  return "Refused";
}

function fulfillmentLabelForDecision(decision: PaiSafeDecision): PaiSafeDisplayFulfillmentLabel {
  if (decision === "SAFE") return "Ready to fulfill";
  if (decision === "HOLD") return "Hold for review";
  return "Do not fulfill";
}

function proofLabelForDecision(decision: PaiSafeDecision): PaiSafeDisplayProofLabel {
  if (decision === "SAFE") return "Proof available";
  if (decision === "HOLD") return "Review record available";
  return "Refusal record available";
}

function reasonLabel(reasonCategory: PaiSafeReasonCategory): string {
  switch (reasonCategory) {
    case "NONE":
      return "No blocking issue detected";
    case "REVIEW_REQUIRED":
      return "Review required";
    case "DESTINATION_INTEGRITY":
      return "Destination integrity issue";
    case "MERCHANT_INTEGRITY":
      return "Merchant integrity issue";
    case "CONSUMER_AGREEMENT":
      return "Agreement or acknowledgment issue";
    case "STRUCTURAL_INTEGRITY":
      return "Transaction structure issue";
    case "DUPLICATE_OR_CONFLICT":
      return "Duplicate or conflicting transaction issue";
    case "MULTIPLE_RISK":
      return "Multiple review signals detected";
  }
}

function nextStepLabel(nextStep: PaiSafeNextStep): string {
  switch (nextStep) {
    case "FULFILL_WITH_CONFIDENCE":
      return "Fulfill with confidence";
    case "WAIT_FOR_REVIEW":
      return "Wait for review";
    case "DO_NOT_FULFILL":
      return "Do not fulfill";
    case "PAYMENT_CAN_PROCEED_WITH_PROOF":
      return "Payment can proceed with proof";
    case "WAIT_FOR_MERCHANT_OR_SYSTEM_REVIEW":
      return "Wait for review";
    case "TRANSACTION_REFUSED_DO_NOT_PAY":
      return "Do not pay";
    case "INTERNAL_REVIEW_NOT_REQUIRED":
      return "Internal review not required";
    case "INTERNAL_REVIEW_REQUIRED":
      return "Internal review required";
    case "INTERNAL_REFUSAL_RECORD_REQUIRED":
      return "Internal refusal record required";
  }
}

function buildCopySafeLabels(
  decision: PaiSafeDecision,
  reasonCategory: PaiSafeReasonCategory,
  nextStep: PaiSafeNextStep
): PaiSafeCopySafeLabels {
  return {
    decisionLabel: decisionLabel(decision),
    statusHeadline:
      decision === "SAFE"
        ? "This transaction is marked safe for this advisory pass."
        : decision === "HOLD"
          ? "This transaction is held for review."
          : "This transaction is refused for this advisory pass.",
    proofLabel: proofLabelForDecision(decision),
    nextStepLabel: nextStepLabel(nextStep),
    reasonLabel: reasonLabel(reasonCategory)
  };
}

function disputeSupportLabel(decision: PaiSafeDecision): string {
  if (decision === "SAFE") return "Proof record available for transaction support.";
  if (decision === "HOLD") return "Review record available before fulfillment.";
  return "Refusal record available. Do not fulfill.";
}

function merchantAllowedActions(decision: PaiSafeDecision): PaiSafePublicAction[] {
  if (decision === "SAFE") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "FULFILL_TRANSACTION"];
  if (decision === "HOLD") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "REQUEST_REVIEW", "WAIT_FOR_REVIEW"];
  return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "DO_NOT_FULFILL"];
}

function consumerAllowedActions(decision: PaiSafeDecision): PaiSafePublicAction[] {
  if (decision === "SAFE") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS"];
  if (decision === "HOLD") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "WAIT_FOR_REVIEW"];
  return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "DO_NOT_PAY"];
}

function internalAllowedActions(decision: PaiSafeDecision): PaiSafePublicAction[] {
  if (decision === "SAFE") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS"];
  if (decision === "HOLD") return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "REQUEST_REVIEW", "WAIT_FOR_REVIEW"];
  return ["VIEW_RECEIPT", "VIEW_PROOF_STATUS", "DO_NOT_FULFILL", "DO_NOT_PAY"];
}

function commonBlockedActions(): PaiSafeBlockedAction[] {
  return [
    "VIEW_INTERNAL_RISK_CODES",
    "VIEW_INTERNAL_HASHES",
    "AUTHORIZE_PAYMENT",
    "WRITE_CUSTODY",
    "PROMOTE_DOCTRINE",
    "MODIFY_TRUST_DECISION",
    "MODIFY_PROOF_RECORD"
  ];
}