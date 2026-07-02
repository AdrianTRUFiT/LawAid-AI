import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_001",
  source: "stripe",
  eventType: "invoice.paid",
  customerId: "cus_001",
  subscriptionId: "sub_001",
  amount: 4900,
  currency: "usd",
  occurredAt: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.normalizedStatus !== "ACTIVE") {
  throw new Error("Expected active billing truth.");
}

console.log("SMOKE_BILLING_TRUTH_ACTIVE=PASS");