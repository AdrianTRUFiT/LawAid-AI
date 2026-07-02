import { normalizeBillingSignal } from "../lib/lawaidai-billing";

const result = normalizeBillingSignal({
  signalType: "customer.subscription.created",
  customerRef: "cust_002",
  subscriptionRef: "sub_002",
  planId: "monthly_flex",
  timestampIso: new Date().toISOString(),
  currentPeriodEndsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  paymentProviderRef: "stripe_sub_002",
});

if (!result.accepted || !result.event) {
  console.error("BILLING_NORMALIZATION_MONTHLY_FAILED");
  process.exit(1);
}

if (result.event.type !== "subscription_activated") {
  console.error("BILLING_NORMALIZATION_MONTHLY_WRONG_EVENT");
  console.error(result.event.type);
  process.exit(1);
}

console.log("LAW_AID_AI_BILLING_NORMALIZE_MONTHLY=PASS");
