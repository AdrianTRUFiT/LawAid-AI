import type {
  BillingTimelineState,
  GovernedBillingEvent,
} from "./billingContracts";

function activeStateForPlan(planId: BillingTimelineState["planId"]): BillingTimelineState["subscriptionState"] {
  if (planId === "monthly_flex") return "active_monthly";
  if (planId === "quarterly_plan") return "active_quarterly";
  return "active_annual";
}

export function reduceBillingEvent(
  state: BillingTimelineState,
  event: GovernedBillingEvent
): BillingTimelineState {
  const next: BillingTimelineState = {
    ...state,
    customerRef: event.customerRef,
    subscriptionRef: event.subscriptionRef ?? state.subscriptionRef,
    planId: event.planId ?? state.planId,
    lastEventType: event.type,
    eventCount: state.eventCount + 1,
  };

  switch (event.type) {
    case "checkout_started":
      next.subscriptionState = "checkout_pending";
      next.checkoutStartedAt = event.effectiveAt;
      return next;

    case "checkout_completed":
      next.subscriptionState = "checkout_pending";
      next.checkoutStartedAt = event.effectiveAt;
      return next;

    case "trial_started":
      next.subscriptionState = "trial_active";
      next.trialStartedAt = event.effectiveAt;
      next.trialEndsAt = event.metadata.trialEndsAt || state.trialEndsAt;
      return next;

    case "trial_converted":
      next.subscriptionState = activeStateForPlan(next.planId);
      next.currentPeriodEndsAt = event.metadata.currentPeriodEndsAt || state.currentPeriodEndsAt;
      next.paymentFailedAt = undefined;
      return next;

    case "subscription_activated":
      next.subscriptionState = activeStateForPlan(next.planId);
      next.currentPeriodEndsAt = event.metadata.currentPeriodEndsAt || state.currentPeriodEndsAt;
      next.paymentFailedAt = undefined;
      return next;

    case "renewal_succeeded":
      next.subscriptionState = activeStateForPlan(next.planId);
      next.currentPeriodEndsAt = event.metadata.currentPeriodEndsAt || state.currentPeriodEndsAt;
      next.paymentFailedAt = undefined;
      return next;

    case "renewal_failed":
      next.subscriptionState = "payment_failed";
      next.paymentFailedAt = event.effectiveAt;
      return next;

    case "canceled_pending_end":
      next.subscriptionState = "canceled_pending_end";
      next.canceledAt = event.effectiveAt;
      next.currentPeriodEndsAt = event.metadata.currentPeriodEndsAt || state.currentPeriodEndsAt;
      return next;

    case "expired":
      next.subscriptionState = "expired_read_only";
      return next;

    case "reactivated":
      next.subscriptionState = activeStateForPlan(next.planId);
      next.currentPeriodEndsAt = event.metadata.currentPeriodEndsAt || state.currentPeriodEndsAt;
      next.paymentFailedAt = undefined;
      return next;

    default:
      return next;
  }
}

export function createEmptyBillingTimelineState(customerRef: string): BillingTimelineState {
  return {
    customerRef,
    subscriptionState: "none",
    eventCount: 0,
  };
}
