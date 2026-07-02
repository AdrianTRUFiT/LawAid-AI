export type PaiSafeDecision = "SAFE" | "HOLD" | "REFUSED";

export type PaiSafeRiskCode =
  | "MISSING_TRANSACTION_ID"
  | "MISSING_MERCHANT_IDENTITY"
  | "INVALID_MERCHANT_IDENTITY"
  | "INCOMPLETE_MERCHANT_PROFILE"
  | "UNKNOWN_VENDOR"
  | "MERCHANT_DESTINATION_MISMATCH"
  | "MERCHANT_RISK_CONTRADICTION"
  | "UNKNOWN_PROCESSOR_ACCOUNT"
  | "DESTINATION_MISMATCH"
  | "INVALID_DESTINATION_FORMAT"
  | "CONFLICTING_TRANSACTION_ROUTING"
  | "UNSUPPORTED_DESTINATION_TYPE"
  | "MISSING_TERMS"
  | "MISSING_REFUND_POLICY"
  | "CONSUMER_ACK_MISSING"
  | "INCOMPLETE_TRANSACTION_ACKNOWLEDGMENT"
  | "CONTRADICTORY_TRANSACTION_CONSENT"
  | "MALFORMED_TRANSACTION_REQUEST"
  | "MISSING_REQUIRED_FIELDS"
  | "INVALID_TRANSACTION_STRUCTURE"
  | "AMOUNT_REVIEW_REQUIRED"
  | "UNUSUAL_TRANSACTION_PATTERN"
  | "CONFLICTING_TRANSACTION_METADATA"
  | "DUPLICATE_TRANSACTION_ATTEMPT"
  | "MULTIPLE_RISK_COMBINATION"
  | "HIGH_CONTRADICTION_RISK"
  | "PROOF_CONSISTENCY_FAILURE"
  | "NO_BLOCKING_RISK";

export interface PaiSafeMerchant {
  merchantId: string;
  displayName: string;
  verifiedIdentity: boolean;
  knownProcessorAccount: boolean;
  expectedProcessorAccount?: string;
  supportedDestinationTypes?: string[];
  riskFlag?: boolean;
}

export interface PaiSafeConsumer {
  consumerId: string;
  displayName: string;
  acknowledgedTerms: boolean;
  acknowledgmentText?: string;
  consentContradiction?: boolean;
}

export interface PaiSafeTransactionRequest {
  transactionId: string;
  merchant: PaiSafeMerchant;
  consumer: PaiSafeConsumer;
  amountCents: number;
  currency: "USD";
  purpose: string;
  paymentDestination: string;
  expectedDestination: string;
  destinationType?: "processor_account" | "bank_account" | "wallet" | "unknown";
  termsText?: string;
  refundPolicyText?: string;
  metadata?: Record<string, string | number | boolean | null>;
  duplicateOfTransactionId?: string;
  createdAt: string;
}

export interface PaiSafeTrustCheck {
  transactionId: string;
  decision: PaiSafeDecision;
  riskCodes: PaiSafeRiskCode[];
  reviewRequired: boolean;
  explanation: string;
  requestHash: string;
  decisionHash: string;
  checkedAt: string;
}

export interface ProofBackProtectionRecord {
  proofBackId: string;
  transactionId: string;
  decision: PaiSafeDecision;
  riskCodes: PaiSafeRiskCode[];
  merchantId: string;
  consumerId: string;
  amountCents: number;
  currency: "USD";
  purpose: string;
  paymentDestination: string;
  requestHash: string;
  decisionHash: string;
  recordHash: string;
  recordStatus: "GENERATED";
  generatedAt: string;
}

export interface ProofBackedReceipt {
  receiptId: string;
  transactionId: string;
  proofBackId: string;
  requestHash: string;
  decisionHash: string;
  recordHash: string;
  receiptHash: string;
  merchantView: {
    transactionStatus: PaiSafeDecision;
    fulfillmentReadiness: "READY_TO_FULFILL" | "HOLD_FOR_REVIEW" | "DO_NOT_FULFILL";
    disputeSupportStatus: "PROOF_RECORD_AVAILABLE" | "REVIEW_RECORD_AVAILABLE" | "REFUSAL_RECORD_AVAILABLE";
  };
  consumerView: {
    safePayStatus: PaiSafeDecision;
    proofAvailable: true;
    message: string;
  };
  issuedAt: string;
}

export interface PaiSafeTransactionCircuitResult {
  request: PaiSafeTransactionRequest;
  trustCheck: PaiSafeTrustCheck;
  proofBack: ProofBackProtectionRecord;
  receipt: ProofBackedReceipt;
}