import { getLawAidAIPlan } from "./lawaidaiPlans";
import type {
  LawAidAIPlanId,
  SubscriptionRecord,
  SubscriptionState,
} from "./billingContracts";

function isoNow(now = new Date()): string {
  return now.toISOString();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function addInterval(iso: string, planId: LawAidAIPlanId): string {
  const d = new Date(iso);
  if (planId === "monthly_flex") {
    d.setMonth(d.getMonth() + 1);
  } else if (planId === "quarterly_plan") {
    d.setMonth(d.getMonth() + 3);
  } else {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d.toISOString();
}

function buildId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function beginCheckout(customerRef: string, planId: LawAidAIPlanId, now = new Date()): SubscriptionRecord {
  const nowIso = isoNow(now);
  return {
    subscriptionId: buildId("sub"),
    customerRef,
    planId,
    startedAt: nowIso,
    checkoutStartedAt: nowIso,
    cancelAtPeriodEnd: false,
  };
}

export function activateFromCheckout(
  customerRef: string,
  planId: LawAidAIPlanId,
  paymentProviderRef?: string,
  now = new Date()
): SubscriptionRecord {
  const plan = getLawAidAIPlan(planId);
  const nowIso = isoNow(now);

  if (plan.trialDays > 0) {
    return {
      subscriptionId: buildId("sub"),
      customerRef,
      planId,
      startedAt: nowIso,
      checkoutStartedAt: nowIso,
      trialStartedAt: nowIso,
      trialEndsAt: addDays(nowIso, plan.trialDays),
      cancelAtPeriodEnd: false,
      lastPaymentProviderRef: paymentProviderRef,
    };
  }

  return {
    subscriptionId: buildId("sub"),
    customerRef,
    planId,
    startedAt: nowIso,
    checkoutStartedAt: nowIso,
    currentPeriodStartsAt: nowIso,
    currentPeriodEndsAt: addInterval(nowIso, planId),
    cancelAtPeriodEnd: false,
    lastPaymentAt: nowIso,
    lastPaymentProviderRef: paymentProviderRef,
  };
}

export function convertTrialToPaid(
  record: SubscriptionRecord,
  paymentProviderRef?: string,
  now = new Date()
): SubscriptionRecord {
  const nowIso = isoNow(now);
  return {
    ...record,
    currentPeriodStartsAt: nowIso,
    currentPeriodEndsAt: addInterval(nowIso, record.planId),
    lastPaymentAt: nowIso,
    lastPaymentProviderRef: paymentProviderRef,
    paymentFailedAt: undefined,
    graceEndsAt: undefined,
  };
}

export function renewSubscription(
  record: SubscriptionRecord,
  paymentProviderRef?: string,
  now = new Date()
): SubscriptionRecord {
  const nowIso = isoNow(now);
  return {
    ...record,
    currentPeriodStartsAt: nowIso,
    currentPeriodEndsAt: addInterval(nowIso, record.planId),
    lastPaymentAt: nowIso,
    lastPaymentProviderRef: paymentProviderRef,
    paymentFailedAt: undefined,
    graceEndsAt: undefined,
  };
}

export function markPaymentFailed(
  record: SubscriptionRecord,
  graceDays = 3,
  now = new Date()
): SubscriptionRecord {
  const nowIso = isoNow(now);
  return {
    ...record,
    paymentFailedAt: nowIso,
    graceEndsAt: addDays(nowIso, graceDays),
  };
}

export function cancelAtPeriodEnd(record: SubscriptionRecord, now = new Date()): SubscriptionRecord {
  return {
    ...record,
    canceledAt: isoNow(now),
    cancelAtPeriodEnd: true,
  };
}

export function deriveSubscriptionState(
  record: SubscriptionRecord | undefined,
  now = new Date()
): SubscriptionState {
  if (!record) {
    return "none";
  }

  const nowMs = now.getTime();

  if (record.checkoutStartedAt && !record.trialStartedAt && !record.currentPeriodStartsAt && !record.paymentFailedAt) {
    return "checkout_pending";
  }

  if (record.trialEndsAt && nowMs < new Date(record.trialEndsAt).getTime()) {
    return "trial_active";
  }

  if (record.paymentFailedAt) {
    if (record.graceEndsAt && nowMs < new Date(record.graceEndsAt).getTime()) {
      return "grace_period";
    }
    return "payment_failed";
  }

  if (record.currentPeriodEndsAt) {
    const periodEndMs = new Date(record.currentPeriodEndsAt).getTime();

    if (record.cancelAtPeriodEnd && nowMs < periodEndMs) {
      return "canceled_pending_end";
    }

    if (nowMs < periodEndMs) {
      if (record.planId === "monthly_flex") return "active_monthly";
      if (record.planId === "quarterly_plan") return "active_quarterly";
      return "active_annual";
    }

    return "expired_read_only";
  }

  if (record.trialEndsAt && nowMs >= new Date(record.trialEndsAt).getTime()) {
    return "reactivation_required";
  }

  return "none";
}
