export type BillingSource =
  | "stripe"
  | "manual"
  | "internal";

export type RawBillingEventType =
  | "checkout.session.completed"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "charge.refunded"
  | "unknown";

export type BillingTruthStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "PENDING"
  | "CANCELLED"
  | "REFUNDED"
  | "REFUSED";

export interface RawBillingEvent {
  eventId: string;
  source: BillingSource;
  eventType: RawBillingEventType | string;
  customerId: string;
  subscriptionId?: string;
  amount?: number;
  currency?: string;
  occurredAt: string;
  metadata?: Record<string, string>;
}

export interface BillingTruthArtifact {
  truthId: string;
  sourceEventId: string;
  customerId: string;
  subscriptionId: string | null;
  normalizedStatus: BillingTruthStatus;
  billingAction:
    | "PROVISION_OK"
    | "HOLD_PROVISION"
    | "CANCEL_ACCESS"
    | "RECORD_REFUND"
    | "REVIEW_REQUIRED";
  amount: number | null;
  currency: string | null;
  confidence: number;
  reason: string;
  createdAt: string;
}

export interface BillingTruthRefusal {
  refusalCode:
    | "MISSING_CUSTOMER_ID"
    | "MALFORMED_EVENT"
    | "UNKNOWN_EVENT_TYPE"
    | "INVALID_AMOUNT";
  refusalReason: string;
}

export interface BillingTruthResult {
  ok: boolean;
  artifact: BillingTruthArtifact | null;
  refusal: BillingTruthRefusal | null;
}