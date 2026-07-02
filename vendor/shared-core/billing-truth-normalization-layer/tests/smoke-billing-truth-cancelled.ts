import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_003",
  source: "stripe",
  eventType: "customer.subscription.deleted",
  customerId: "cus_003",
  subscriptionId: "sub_003",
  occurredAt: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.normalizedStatus !== "CANCELLED") {
  throw new Error("Expected cancelled billing truth.");
}

console.log("SMOKE_BILLING_TRUTH_CANCELLED=PASS");