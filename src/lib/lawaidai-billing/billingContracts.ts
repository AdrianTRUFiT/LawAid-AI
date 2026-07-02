export type RawBillingSignalType =
  | "checkout.session.completed"
  | "customer.subscription.created"
  | "invoice.paid"
  | "invoice.payment_failed"
  | "customer.subscription.updated"
  | "customer.subscription.deleted";

export interface RawBillingSignal {
  signalType: RawBillingSignalType;
  customerRef: string;
  subscriptionRef?: string;
  planId?: "monthly_flex" | "quarterly_plan" | "annual_pro";
  timestampIso: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  cancelAtPeriodEnd?: boolean;
  paymentProviderRef?: string;
}

export type GovernedBillingEventType =
  | "checkout_started"
  | "checkout_completed"
  | "trial_started"
  | "trial_converted"
  | "subscription_activated"
  | "renewal_succeeded"
  | "renewal_failed"
  | "canceled_pending_end"
  | "expired"
  | "reactivated";

export interface GovernedBillingEvent {
  type: GovernedBillingEventType;
  customerRef: string;
  subscriptionRef?: string;
  planId?: "monthly_flex" | "quarterly_plan" | "annual_pro";
  effectiveAt: string;
  paymentProviderRef?: string;
  metadata: Record<string, string>;
}

export interface BillingTimelineState {
  customerRef: string;
  subscriptionRef?: string;
  planId?: "monthly_flex" | "quarterly_plan" | "annual_pro";
  subscriptionState:
    | "none"
    | "checkout_pending"
    | "trial_active"
    | "active_monthly"
    | "active_quarterly"
    | "active_annual"
    | "grace_period"
    | "payment_failed"
    | "expired_read_only"
    | "canceled_pending_end"
    | "reactivation_required";
  checkoutStartedAt?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  paymentFailedAt?: string;
  canceledAt?: string;
  lastEventType?: GovernedBillingEventType;
  eventCount: number;
}

export interface BillingNormalizationResult {
  accepted: boolean;
  event?: GovernedBillingEvent;
  reason?: string;
}
