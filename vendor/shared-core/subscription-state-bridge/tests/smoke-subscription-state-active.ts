import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "cus_001",
  billingTruth: {
    truthId: "billing_truth_evt_001",
    sourceEventId: "evt_001",
    customerId: "cus_001",
    subscriptionId: "sub_001",
    normalizedStatus: "ACTIVE",
    billingAction: "PROVISION_OK",
    amount: 4900,
    currency: "USD",
    confidence: 0.9,
    reason: "Billing event normalized into active subscription truth.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.subscriptionState !== "active" || result.artifact.provisioningPosture !== "ALLOW") {
  throw new Error("Expected active subscription state.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_ACTIVE=PASS");