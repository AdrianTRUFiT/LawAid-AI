import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_004",
  source: "stripe",
  eventType: "charge.refunded",
  customerId: "cus_004",
  subscriptionId: "sub_004",
  amount: 4900,
  currency: "usd",
  occurredAt: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.normalizedStatus !== "REFUNDED") {
  throw new Error("Expected refunded billing truth.");
}

console.log("SMOKE_BILLING_TRUTH_REFUND=PASS");