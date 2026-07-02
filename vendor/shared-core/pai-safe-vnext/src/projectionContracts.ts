import type {
  PaiSafeDecision,
  PaiSafeRiskCode,
  PaiSafeTransactionCircuitResult,
  ProofBackProtectionRecord,
  ProofBackedReceipt
} from "./contracts.js";

export type PaiSafeProjectionRole = "MERCHANT" | "CONSUMER" | "INTERNAL_REVIEW";

export type PaiSafeProofStatus =
  | "PROOF_AVAILABLE"
  | "REVIEW_RECORD_AVAILABLE"
  | "REFUSAL_RECORD_AVAILABLE";

export type PaiSafeReasonCategory =
  | "NONE"
  | "REVIEW_REQUIRED"
  | "DESTINATION_INTEGRITY"
  | "MERCHANT_INTEGRITY"
  | "CONSUMER_AGREEMENT"
  | "STRUCTURAL_INTEGRITY"
  | "DUPLICATE_OR_CONFLICT"
  | "MULTIPLE_RISK";

export type PaiSafeNextStep =
  | "FULFILL_WITH_CONFIDENCE"
  | "WAIT_FOR_REVIEW"
  | "DO_NOT_FULFILL"
  | "PAYMENT_CAN_PROCEED_WITH_PROOF"
  | "WAIT_FOR_MERCHANT_OR_SYSTEM_REVIEW"
  | "TRANSACTION_REFUSED_DO_NOT_PAY"
  | "INTERNAL_REVIEW_NOT_REQUIRED"
  | "INTERNAL_REVIEW_REQUIRED"
  | "INTERNAL_REFUSAL_RECORD_REQUIRED";

export interface PaiSafeTimelineItem {
  label: string;
  at: string;
  visibleTo: PaiSafeProjectionRole[];
}

export interface PaiSafeMerchantProjection {
  role: "MERCHANT";
  transactionId: string;
  transactionStatus: PaiSafeDecision;
  fulfillmentReadiness: ProofBackedReceipt["merchantView"]["fulfillmentReadiness"];
  proofBackStatus: PaiSafeProofStatus;
  receiptAvailable: boolean;
  proofAvailable: boolean;
  reasonCategory: PaiSafeReasonCategory;
  disputeSupportStatus: ProofBackedReceipt["merchantView"]["disputeSupportStatus"];
  nextStep: PaiSafeNextStep;
  timeline: PaiSafeTimelineItem[];
  permissions: {
    canFulfill: boolean;
    canRequestReview: boolean;
    canViewInternalRiskCodes: false;
    canViewProofRecord: boolean;
    canViewReceipt: boolean;
  };
}

export interface PaiSafeConsumerProjection {
  role: "CONSUMER";
  transactionId: string;
  safePayStatus: PaiSafeDecision;
  receiptAvailable: boolean;
  proofAvailable: boolean;
  userMessage: string;
  reasonCategory: PaiSafeReasonCategory;
  nextStep: PaiSafeNextStep;
  timeline: PaiSafeTimelineItem[];
  permissions: {
    canPayWithConfidence: boolean;
    canViewMerchantRiskInternals: false;
    canViewInternalRiskCodes: false;
    canViewReceipt: boolean;
    canViewProofStatus: boolean;
  };
}

export interface PaiSafeInternalReviewProjection {
  role: "INTERNAL_REVIEW";
  transactionId: string;
  trustDecision: PaiSafeDecision;
  riskCodes: PaiSafeRiskCode[];
  reviewRequired: boolean;
  reasonCategory: PaiSafeReasonCategory;
  requestHash: string;
  decisionHash: string;
  recordHash: string;
  receiptHash: string;
  proofBack: ProofBackProtectionRecord;
  receipt: ProofBackedReceipt;
  receiptConsistent: boolean;
  proofBackConsistent: boolean;
  timeline: PaiSafeTimelineItem[];
  nextStep: PaiSafeNextStep;
  permissions: {
    canViewFullRiskCodes: true;
    canViewProofRecord: true;
    canViewReceipt: true;
    canAuthorizePayment: false;
    canWriteCustody: false;
    canPromoteDoctrine: false;
  };
}

export interface PaiSafeRoleStateProjection {
  transactionId: string;
  decision: PaiSafeDecision;
  merchant: PaiSafeMerchantProjection;
  consumer: PaiSafeConsumerProjection;
  internalReview: PaiSafeInternalReviewProjection;
}

export type PaiSafeProjectableCircuit = PaiSafeTransactionCircuitResult;