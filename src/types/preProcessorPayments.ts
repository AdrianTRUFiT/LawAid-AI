export type DecisionStatus =
  | 'approved_for_validation'
  | 'denied'
  | 'needs_review';

export type ValidationStatus =
  | 'pending'
  | 'valid'
  | 'invalid'
  | 'needs_review';

export type AuthorizationStatus =
  | 'pending'
  | 'authorized'
  | 'denied'
  | 'manual_review_required'
  | 'expired';

export type AuthorizationMode =
  | 'manual_only'
  | 'preapproved_with_rules'
  | 'auto_if_within_rules';

export type TransactionType =
  | 'legal_invoice'
  | 'filing_fee'
  | 'expert_fee'
  | 'mediator_fee'
  | 'service_payment'
  | 'vendor_payment'
  | 'reimbursement'
  | 'other_case_obligation';

export type TransactionStatus =
  | 'identified'
  | 'categorized'
  | 'awaiting_review'
  | 'approved'
  | 'authorized'
  | 'scheduled'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'disputed'
  | 'canceled';

export type PaymentSourceType =
  | 'card'
  | 'bank_account'
  | 'external_manual'
  | 'other';

export type PreReconciliationStatus =
  | 'pending'
  | 'matched'
  | 'mismatch'
  | 'needs_review';

export type ProcessorSubmissionStatus =
  | 'not_submitted'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export interface PaymentIntentPacket {
  id: string;
  workspaceId: string;
  matterId: string;
  payerId: string;
  payeeId: string;
  obligationId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  reasonCode: string;
  dueDate?: string;
  approvalMode: AuthorizationMode;
  supportingRefs: string[];
  validationStatus: ValidationStatus;
  decisionStatus: DecisionStatus;
  decisionReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAuthorizationRecord {
  id: string;
  paymentIntentId: string;
  workspaceId: string;
  matterId: string;
  paymentSourceId: string;
  authorizedBy: string;
  authorizationMode: AuthorizationMode;
  authorizedAmount: number;
  allowedPayeeId: string;
  expiresAt?: string;
  status: AuthorizationStatus;
  ruleSnapshot: string[];
  signatureOrHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatterTransaction {
  id: string;
  workspaceId: string;
  matterId: string;
  title: string;
  description?: string;
  transactionType: TransactionType;
  category: string;
  counterpartyId: string;
  counterpartyName?: string;
  linkedObligationId?: string;
  linkedInvoiceId?: string;
  linkedAuthorizationId?: string;
  amountExpected: number;
  amountApproved?: number;
  platformFee: number;
  totalToProcess: number;
  dueDate?: string;
  scheduledDate?: string;
  paidDate?: string;
  paymentSourceId?: string;
  status: TransactionStatus;
  reviewRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSource {
  id: string;
  workspaceId: string;
  matterId: string;
  sourceType: PaymentSourceType;
  label: string;
  last4?: string;
  cardBrand?: string;
  billingName?: string;
  isDefault: boolean;
  isPreapproved: boolean;
  spendingRules?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentAuthorizationRule {
  id: string;
  workspaceId: string;
  matterId: string;
  paymentSourceId?: string;
  approvalMode: AuthorizationMode;
  maxSingleTransaction?: number;
  maxMonthlyProcessing?: number;
  allowedCategories: string[];
  requiresManualReviewAbove?: number;
  autoPayEnabled: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledTransaction {
  id: string;
  workspaceId: string;
  matterId: string;
  transactionId: string;
  authorizationId: string;
  scheduledFor: string;
  amount: number;
  platformFee: number;
  totalCharge: number;
  counterpartyId: string;
  counterpartyName?: string;
  paymentSourceId: string;
  scheduleReason?: string;
  status: 'scheduled' | 'blocked' | 'processing' | 'paid' | 'failed' | 'canceled';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionProcessingRecord {
  id: string;
  workspaceId: string;
  matterId: string;
  transactionId: string;
  authorizationId: string;
  scheduledTransactionId?: string;
  processorReference?: string;
  amountPaid?: number;
  platformFeeCharged?: number;
  totalCharged?: number;
  paymentSourceId: string;
  paidAt?: string;
  status: ProcessorSubmissionStatus;
  receiptIds: string[];
  processorPayloadHash?: string;
  notes?: string;
}

export interface PreProcessorReviewRecord {
  id: string;
  workspaceId: string;
  matterId: string;
  paymentIntentId: string;
  invoiceId?: string;
  decisionStatus: DecisionStatus;
  validationStatus: ValidationStatus;
  authorizationStatus: AuthorizationStatus | 'not_attempted';
  preReconciliationStatus: PreReconciliationStatus;
  refusalReasons: string[];
  reviewReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransactionAnomalyFlag {
  id: string;
  workspaceId: string;
  matterId: string;
  transactionId?: string;
  processingRecordId?: string;
  invoiceId?: string;
  severity: 'low' | 'medium' | 'high';
  type:
    | 'amount_mismatch'
    | 'payee_mismatch'
    | 'duplicate_attempt'
    | 'missing_support'
    | 'missing_source'
    | 'processor_confirmation_mismatch'
    | 'unauthorized_submission';
  explanation: string;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface PreProcessorGovernanceState {
  workspaceId: string;
  paymentIntents: PaymentIntentPacket[];
  authorizations: PaymentAuthorizationRecord[];
  transactions: MatterTransaction[];
  paymentSources: PaymentSource[];
  authorizationRules: PaymentAuthorizationRule[];
  scheduledTransactions: ScheduledTransaction[];
  processingRecords: TransactionProcessingRecord[];
  preProcessorReviews: PreProcessorReviewRecord[];
  anomalies: TransactionAnomalyFlag[];
  updatedAt: string;
}
