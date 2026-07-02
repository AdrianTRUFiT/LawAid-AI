import type {
  PaymentStatus,
  VerificationStatus,
} from "./types";

export const FUNDTRACKER_VERSION = "1.0.0";

export const FUNDTRACKER_ARTIFACT_TYPES = {
  inbound: "VerifiedOpportunity",
  processorEvent: "ProcessorEvent",
  transactionIntent: "TransactionIntent",
  verificationDecision: "VerificationDecision",
  activatedTransactionState: "ActivatedTransactionState",
  heldTransactionState: "HeldTransactionState",
  refusedTransactionState: "RefusedTransactionState",
} as const;

export const FUNDTRACKER_DEFAULT_CURRENCY = "USD";

export const FUNDTRACKER_ALLOWED_SUCCESS_PROCESSOR_STATUSES = [
  "succeeded",
] as const;

export const FUNDTRACKER_PAYMENT_STATUS_FLOW: PaymentStatus[] = [
  "initiated",
  "pending",
  "processor-confirmed",
  "verified",
  "activated",
];

export const FUNDTRACKER_NON_SUCCESS_PAYMENT_STATUSES: PaymentStatus[] = [
  "held",
  "refused",
  "failed",
  "canceled",
  "refunded",
  "disputed",
];

export const FUNDTRACKER_VERIFICATION_SUCCESS: VerificationStatus = "verified";

export const FUNDTRACKER_VERIFICATION_NON_SUCCESS: VerificationStatus[] = [
  "pending",
  "held",
  "refused",
];

export const FUNDTRACKER_REFUSAL_CODES = {
  amountMismatch: "AMOUNT_MISMATCH",
  currencyMismatch: "CURRENCY_MISMATCH",
  missingOpportunity: "MISSING_OPPORTUNITY",
  invalidProcessorEvent: "INVALID_PROCESSOR_EVENT",
  invalidAmount: "INVALID_AMOUNT",
  duplicateActivation: "DUPLICATE_ACTIVATION",
  unsupportedStatus: "UNSUPPORTED_STATUS",
  missingProcessorReference: "MISSING_PROCESSOR_REFERENCE",
  unknown: "UNKNOWN",
} as const;

export const FUNDTRACKER_DEFAULT_PLATFORM_FEE_RATE = 0.01;
export const FUNDTRACKER_DEFAULT_PROCESSOR_FEE_RATE = 0.029;
export const FUNDTRACKER_DEFAULT_PROCESSOR_FLAT_FEE = 0.3;
