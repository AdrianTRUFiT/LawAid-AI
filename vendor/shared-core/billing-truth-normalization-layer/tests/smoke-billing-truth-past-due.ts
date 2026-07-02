import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_002",
  source: "stripe",
  eventType: "invoice.payment_failed",
  customerId: "cus_002",
  subscriptionId: "sub_002",
  amount: 4900,
  currency: "usd",
  occurredAt: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.normalizedStatus !== "PAST_DUE" || result.artifact.billingAction !== "HOLD_PROVISION") {
  throw new Error("Expected past-due billing truth.");
}

console.log("SMOKE_BILLING_TRUTH_PAST_DUE=PASS");