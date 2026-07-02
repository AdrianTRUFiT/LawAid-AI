import type {
  PaiSafeDecision
} from "./contracts.js";

import type {
  PaiSafeMerchantProjection,
  PaiSafeConsumerProjection,
  PaiSafeInternalReviewProjection,
  PaiSafeReasonCategory,
  PaiSafeNextStep
} from "./projectionContracts.js";

export type PaiSafeSurfaceRole = "MERCHANT_SURFACE" | "CONSUMER_SURFACE" | "INTERNAL_REVIEW_SURFACE";

export type PaiSafeSurfaceTone = "success" | "warning" | "danger";

export type PaiSafeDisplayDecisionLabel =
  | "Safe"
  | "Held for Review"
  | "Refused";

export type PaiSafeDisplayFulfillmentLabel =
  | "Ready to fulfill"
  | "Hold for review"
  | "Do not fulfill";

export type PaiSafeDisplayProofLabel =
  | "Proof available"
  | "Review record available"
  | "Refusal record available";

export type PaiSafePublicAction =
  | "VIEW_RECEIPT"
  | "VIEW_PROOF_STATUS"
  | "REQUEST_REVIEW"
  | "FULFILL_TRANSACTION"
  | "DO_NOT_FULFILL"
  | "DO_NOT_PAY"
  | "WAIT_FOR_REVIEW";

export type PaiSafeBlockedAction =
  | "VIEW_INTERNAL_RISK_CODES"
  | "VIEW_INTERNAL_HASHES"
  | "AUTHORIZE_PAYMENT"
  | "WRITE_CUSTODY"
  | "PROMOTE_DOCTRINE"
  | "MODIFY_TRUST_DECISION"
  | "MODIFY_PROOF_RECORD";

export interface PaiSafeCopySafeLabels {
  decisionLabel: PaiSafeDisplayDecisionLabel;
  statusHeadline: string;
  proofLabel: PaiSafeDisplayProofLabel;
  nextStepLabel: string;
  reasonLabel: string;
}

export interface PaiSafeHiddenFieldPolicy {
  hiddenFromMerchant: string[];
  hiddenFromConsumer: string[];
  internalOnly: string[];
}

export interface PaiSafeMerchantSafeTransactionCard {
  role: "MERCHANT_SURFACE";
  transactionId: string;
  decision: PaiSafeDecision;
  tone: PaiSafeSurfaceTone;
  labels: PaiSafeCopySafeLabels;
  fulfillmentLabel: PaiSafeDisplayFulfillmentLabel;
  proofAvailable: boolean;
  receiptAvailable: boolean;
  reasonCategory: PaiSafeReasonCategory;
  disputeSupportLabel: string;
  allowedActions: PaiSafePublicAction[];
  blockedActions: PaiSafeBlockedAction[];
  timelineLabels: string[];
  sourceProjection: "MERCHANT_PROJECTION";
  readOnly: true;
}

export interface PaiSafeConsumerSafePayReceiptView {
  role: "CONSUMER_SURFACE";
  transactionId: string;
  decision: PaiSafeDecision;
  tone: PaiSafeSurfaceTone;
  labels: PaiSafeCopySafeLabels;
  userMessage: string;
  proofAvailable: boolean;
  receiptAvailable: boolean;
  reasonCategory: PaiSafeReasonCategory;
  allowedActions: PaiSafePublicAction[];
  blockedActions: PaiSafeBlockedAction[];
  timelineLabels: string[];
  sourceProjection: "CONSUMER_PROJECTION";
  readOnly: true;
}

export interface PaiSafeInternalReviewPacket {
  role: "INTERNAL_REVIEW_SURFACE";
  transactionId: string;
  decision: PaiSafeDecision;
  tone: PaiSafeSurfaceTone;
  reasonCategory: PaiSafeReasonCategory;
  riskCodes: string[];
  hashes: {
    requestHash: string;
    decisionHash: string;
    recordHash: string;
    receiptHash: string;
  };
  consistency: {
    proofBackConsistent: boolean;
    receiptConsistent: boolean;
  };
  reviewRequired: boolean;
  nextStep: PaiSafeNextStep;
  proofBackId: string;
  receiptId: string;
  allowedActions: PaiSafePublicAction[];
  blockedActions: PaiSafeBlockedAction[];
  timelineLabels: string[];
  sourceProjection: "INTERNAL_REVIEW_PROJECTION";
  readOnly: true;
}

export interface PaiSafeSurfaceContractPacket {
  transactionId: string;
  decision: PaiSafeDecision;
  merchantCard: PaiSafeMerchantSafeTransactionCard;
  consumerReceiptView: PaiSafeConsumerSafePayReceiptView;
  internalReviewPacket: PaiSafeInternalReviewPacket;
  hiddenFieldPolicy: PaiSafeHiddenFieldPolicy;
  stateToUiMapping: {
    circuit: "DECIDES";
    projection: "REFLECTS";
    surfaceContract: "MAPS";
    ui: "RENDERS_LATER";
  };
}

export interface PaiSafeSurfaceInput {
  merchant: PaiSafeMerchantProjection;
  consumer: PaiSafeConsumerProjection;
  internalReview: PaiSafeInternalReviewProjection;
}