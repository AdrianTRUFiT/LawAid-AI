import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_006",
  source: "stripe",
  eventType: "invoice.paid",
  customerId: "",
  occurredAt: new Date().toISOString(),
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_CUSTOMER_ID") {
  throw new Error("Expected missing-customer refusal.");
}

console.log("SMOKE_BILLING_TRUTH_MISSING_CUSTOMER=PASS");