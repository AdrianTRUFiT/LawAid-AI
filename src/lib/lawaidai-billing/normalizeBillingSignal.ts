import type {
  BillingNormalizationResult,
  GovernedBillingEvent,
  RawBillingSignal,
} from "./billingContracts";

export function normalizeBillingSignal(
  signal: RawBillingSignal
): BillingNormalizationResult {
  const base = {
    customerRef: signal.customerRef,
    subscriptionRef: signal.subscriptionRef,
    planId: signal.planId,
    effectiveAt: signal.timestampIso,
    paymentProviderRef: signal.paymentProviderRef,
    metadata: {} as Record<string, string>,
  };

  switch (signal.signalType) {
    case "checkout.session.completed": {
      const event: GovernedBillingEvent = {
        ...base,
        type: "checkout_completed",
        metadata: {
          origin: "stripe_checkout",
        },
      };
      return { accepted: true, event };
    }

    case "customer.subscription.created": {
      if (signal.planId === "annual_pro" && signal.trialEndsAt) {
        const event: GovernedBillingEvent = {
          ...base,
          type: "trial_started",
          metadata: {
            trialEndsAt: signal.trialEndsAt,
          },
        };
        return { accepted: true, event };
      }

      const event: GovernedBillingEvent = {
        ...base,
        type: "subscription_activated",
        metadata: {
          currentPeriodEndsAt: signal.currentPeriodEndsAt ?? "",
        },
      };
      return { accepted: true, event };
    }

    case "invoice.paid": {
      const event: GovernedBillingEvent = {
        ...base,
        type: "renewal_succeeded",
        metadata: {
          currentPeriodEndsAt: signal.currentPeriodEndsAt ?? "",
        },
      };
      return { accepted: true, event };
    }

    case "invoice.payment_failed": {
      const event: GovernedBillingEvent = {
        ...base,
        type: "renewal_failed",
        metadata: {},
      };
      return { accepted: true, event };
    }

    case "customer.subscription.updated": {
      if (signal.cancelAtPeriodEnd) {
        const event: GovernedBillingEvent = {
          ...base,
          type: "canceled_pending_end",
          metadata: {
            currentPeriodEndsAt: signal.currentPeriodEndsAt ?? "",
          },
        };
        return { accepted: true, event };
      }

      if (signal.planId === "annual_pro" && signal.currentPeriodEndsAt) {
        const event: GovernedBillingEvent = {
          ...base,
          type: "trial_converted",
          metadata: {
            currentPeriodEndsAt: signal.currentPeriodEndsAt,
          },
        };
        return { accepted: true, event };
      }

      const event: GovernedBillingEvent = {
        ...base,
        type: "reactivated",
        metadata: {
          currentPeriodEndsAt: signal.currentPeriodEndsAt ?? "",
        },
      };
      return { accepted: true, event };
    }

    case "customer.subscription.deleted": {
      const event: GovernedBillingEvent = {
        ...base,
        type: "expired",
        metadata: {},
      };
      return { accepted: true, event };
    }

    default:
      return {
        accepted: false,
        reason: "Unhandled billing signal type.",
      };
  }
}
