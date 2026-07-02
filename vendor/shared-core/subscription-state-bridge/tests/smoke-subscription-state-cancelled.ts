import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "cus_003",
  billingTruth: {
    truthId: "billing_truth_evt_003",
    sourceEventId: "evt_003",
    customerId: "cus_003",
    subscriptionId: "sub_003",
    normalizedStatus: "CANCELLED",
    billingAction: "CANCEL_ACCESS",
    amount: null,
    currency: null,
    confidence: 0.95,
    reason: "Subscription deletion normalized into cancellation truth.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.subscriptionState !== "cancelled" || result.artifact.provisioningPosture !== "CANCEL") {
  throw new Error("Expected cancelled subscription state.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_CANCELLED=PASS");