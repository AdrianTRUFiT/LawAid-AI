export type PaymentMode =
  | "card"
  | "ach"
  | "wallet"
  | "bank_transfer"
  | "pay_by_link"
  | "other";

export type DestinationType =
  | "subscription_activation"
  | "one_time_purchase"
  | "invoice_settlement"
  | "account_credit"
  | "service_unlock"
  | "other";

export type PaymentStatus =
  | "initiated"
  | "pending"
  | "processor-confirmed"
  | "verified"
  | "held"
  | "refused"
  | "failed"
  | "canceled"
  | "refunded"
  | "disputed"
  | "activated";

export type VerificationStatus =
  | "pending"
  | "held"
  | "refused"
  | "verified";

export interface VerifiedOpportunity {
  verifiedOpportunityId: string;
  sourceSystem: string;
  merchantId: string;
  customerId: string;
  productId: string;
  productName: string;
  offerId?: string;
  planId?: string;
  amount: number;
  currency: string;
  paymentMode: PaymentMode;
  destinationType: DestinationType;
  successRoute: string;
  cancelRoute: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ProcessorEvent {
  processorReference: string;
  transactionId: string;
  eventType: string;
  amount: number;
  currency: string;
  receivedAt: string;
  rawStatus: string;
  metadata?: Record<string, unknown>;
}

export interface RefusalReason {
  code:
    | "AMOUNT_MISMATCH"
    | "CURRENCY_MISMATCH"
    | "MISSING_OPPORTUNITY"
    | "INVALID_PROCESSOR_EVENT"
    | "INVALID_AMOUNT"
    | "DUPLICATE_ACTIVATION"
    | "UNSUPPORTED_STATUS"
    | "MISSING_PROCESSOR_REFERENCE"
    | "UNKNOWN";
  message: string;
  details?: Record<string, unknown>;
}

export interface TransactionIntent {
  transactionId: string;
  verifiedOpportunity: VerifiedOpportunity;
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDecision {
  allowed: boolean;
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  reasons: RefusalReason[];
  evaluatedAt: string;
}

export interface ActivatedTransactionState {
  transactionId: string;
  merchantId: string;
  customerId: string;
  verifiedOpportunityId: string;
  processorReference: string;
  paymentStatus: PaymentStatus;
  verificationStatus: VerificationStatus;
  grossAmount: number;
  processorFees: number;
  platformFees: number;
  netAmount: number;
  currency: string;
  entitlement: Record<string, unknown>;
  activationPermission: boolean;
  destination: DestinationType;
  successRoute: string;
  cancelRoute: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}
