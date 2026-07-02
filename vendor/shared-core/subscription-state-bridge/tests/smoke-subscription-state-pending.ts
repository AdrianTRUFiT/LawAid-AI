import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "cus_006",
  billingTruth: {
    truthId: "billing_truth_evt_006",
    sourceEventId: "evt_006",
    customerId: "cus_006",
    subscriptionId: "sub_006",
    normalizedStatus: "PENDING",
    billingAction: "REVIEW_REQUIRED",
    amount: null,
    currency: null,
    confidence: 0.7,
    reason: "Pending event normalized into review-required truth.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.subscriptionState !== "pending_review" || result.artifact.provisioningPosture !== "REVIEW") {
  throw new Error("Expected pending_review subscription state.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_PENDING=PASS");