import { runBillingTruthNormalization } from "../src/index.js";

const result = runBillingTruthNormalization({
  eventId: "evt_005",
  source: "stripe",
  eventType: "payout.sent",
  customerId: "cus_005",
  occurredAt: new Date().toISOString(),
});

if (result.ok || result.refusal?.refusalCode !== "UNKNOWN_EVENT_TYPE") {
  throw new Error("Expected unknown-event refusal.");
}

console.log("SMOKE_BILLING_TRUTH_UNKNOWN=PASS");