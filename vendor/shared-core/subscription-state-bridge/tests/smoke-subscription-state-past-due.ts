import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "cus_002",
  billingTruth: {
    truthId: "billing_truth_evt_002",
    sourceEventId: "evt_002",
    customerId: "cus_002",
    subscriptionId: "sub_002",
    normalizedStatus: "PAST_DUE",
    billingAction: "HOLD_PROVISION",
    amount: 4900,
    currency: "USD",
    confidence: 0.95,
    reason: "Payment failure normalized into past-due subscription truth.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.subscriptionState !== "past_due" || result.artifact.provisioningPosture !== "HOLD") {
  throw new Error("Expected past_due subscription state.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_PAST_DUE=PASS");