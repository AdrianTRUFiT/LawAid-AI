import { normalizeBillingSignal } from "../lib/lawaidai-billing";

const result = normalizeBillingSignal({
  signalType: "invoice.payment_failed",
  customerRef: "cust_003",
  subscriptionRef: "sub_003",
  planId: "quarterly_plan",
  timestampIso: new Date().toISOString(),
  paymentProviderRef: "stripe_inv_003",
});

if (!result.accepted || !result.event) {
  console.error("BILLING_NORMALIZATION_FAILED_PAYMENT_FAILED");
  process.exit(1);
}

if (result.event.type !== "renewal_failed") {
  console.error("BILLING_NORMALIZATION_FAILED_PAYMENT_WRONG_EVENT");
  console.error(result.event.type);
  process.exit(1);
}

console.log("LAW_AID_AI_BILLING_NORMALIZE_PAYMENT_FAILED=PASS");
