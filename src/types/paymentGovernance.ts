// src/types/paymentGovernance.ts

export type PaymentSourceType =
  | 'bank_account'
  | 'debit_card'
  | 'credit_card'
  | 'manual_external'
  | 'other';

export type PaymentSourceStatus = 'active' | 'inactive';

export type PaymentPolicyTrigger =
  | 'manual_only'
  | 'due_date'
  | 'threshold'
  | 'approved_invoice_only';

export type AuthorizationStatus =
  | 'pending'
  | 'approved'
  | 'revoked'
  | 'expired';

export type ScheduledPaymentStatus =
  | 'draft'
  | 'scheduled'
  | 'ready'
  | 'facilitated'
  | 'canceled';

export type FacilitationStatus =
  | 'created'
  | 'submitted'
  | 'confirmed'
  | 'failed';

export type ProofBundleStatus = 'draft' | 'confirmed';

export type PaymeterRuleType =
  | 'due_within_days'
  | 'amount_threshold'
  | 'invoice_status_required'
  | 'vendor_required';

export type PaymeterEvaluationOutcome =
  | 'approved'
  | 'blocked'
  | 'review_required';

export interface PaymentSource {
  id: string;
  workspaceId: string;
  label: string;
  sourceType: PaymentSourceType;
  last4?: string;
  providerName?: string;
  status: PaymentSourceStatus;
  isDefault?: boolean;
  notes?: string;
  createdAt: string;
}

export interface PaymentPolicy {
  id: string;
  workspaceId: string;
  label: string;
  trigger: PaymentPolicyTrigger;
  maxPerPayment?: number;
  allowAutoScheduling: boolean;
  requiresExplicitApproval: boolean;
  allowedVendorNames?: string[];
  notes?: string;
  createdAt: string;
}

export interface AuthorizationEvent {
  id: string;
  workspaceId: string;
  invoiceId: string;
  vendorName: string;
  approvedAmount: number;
  paymentSourceId: string;
  policyId?: string;
  status: AuthorizationStatus;
  reason?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ScheduledPayment {
  id: string;
  workspaceId: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  scheduledDate: string;
  paymentSourceId: string;
  authorizationEventId: string;
  status: ScheduledPaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface FacilitationEvent {
  id: string;
  workspaceId: string;
  scheduledPaymentId: string;
  invoiceId: string;
  vendorName: string;
  amount: number;
  status: FacilitationStatus;
  initiatedAt: string;
  completedAt?: string;
  paymentRecordId?: string;
  notes?: string;
}

export interface ProofBundle {
  id: string;
  workspaceId: string;
  invoiceId: string;
  paymentRecordId?: string;
  facilitationEventId?: string;
  authorizationEventId?: string;
  items: Array<{
    type:
      | 'invoice'
      | 'authorization'
      | 'schedule'
      | 'facilitation'
      | 'payment_confirmation'
      | 'receipt'
      | 'note';
    label: string;
    linkedId?: string;
  }>;
  status: ProofBundleStatus;
  createdAt: string;
}

export interface PaymeterRule {
  id: string;
  workspaceId: string;
  label: string;
  ruleType: PaymeterRuleType;
  enabled: boolean;
  config: {
    daysUntilDue?: number;
    maxAmount?: number;
    requiredInvoiceStatus?: string;
    vendorName?: string;
  };
  createdAt: string;
}

export interface PaymeterEvaluation {
  id: string;
  workspaceId: string;
  invoiceId: string;
  outcome: PaymeterEvaluationOutcome;
  reasons: string[];
  evaluatedAt: string;
}

export interface PaymentGovernanceState {
  workspaceId: string;
  sources: PaymentSource[];
  policies: PaymentPolicy[];
  authorizations: AuthorizationEvent[];
  scheduledPayments: ScheduledPayment[];
  facilitations: FacilitationEvent[];
  proofBundles: ProofBundle[];
  paymeterRules: PaymeterRule[];
  evaluations: PaymeterEvaluation[];
  updatedAt: string;
}
