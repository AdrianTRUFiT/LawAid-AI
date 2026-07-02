import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "cus_004",
  billingTruth: {
    truthId: "billing_truth_evt_004",
    sourceEventId: "evt_004",
    customerId: "cus_004",
    subscriptionId: "sub_004",
    normalizedStatus: "REFUNDED",
    billingAction: "RECORD_REFUND",
    amount: 4900,
    currency: "USD",
    confidence: 0.95,
    reason: "Refund event normalized into refund truth.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.subscriptionState !== "refund_recorded" || result.artifact.provisioningPosture !== "BLOCK") {
  throw new Error("Expected refund_recorded subscription state.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_REFUND=PASS");