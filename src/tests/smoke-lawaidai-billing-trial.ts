import { normalizeBillingSignal } from "../lib/lawaidai-billing";

const result = normalizeBillingSignal({
  signalType: "customer.subscription.created",
  customerRef: "cust_001",
  subscriptionRef: "sub_001",
  planId: "annual_pro",
  timestampIso: new Date().toISOString(),
  trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
  paymentProviderRef: "stripe_sub_001",
});

if (!result.accepted || !result.event) {
  console.error("BILLING_NORMALIZATION_TRIAL_FAILED");
  process.exit(1);
}

if (result.event.type !== "trial_started") {
  console.error("BILLING_NORMALIZATION_TRIAL_WRONG_EVENT");
  console.error(result.event.type);
  process.exit(1);
}

console.log("LAW_AID_AI_BILLING_NORMALIZE_TRIAL=PASS");
