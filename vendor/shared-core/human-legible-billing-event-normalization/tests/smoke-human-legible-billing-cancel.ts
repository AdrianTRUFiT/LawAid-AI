import { runHumanLegibleBillingEventNormalization } from "../src/index.js";

const result = runHumanLegibleBillingEventNormalization({
  subjectId: "cus_204",
  billingTruth: {
    truthId: "billing_truth_204",
    sourceEventId: "evt_204",
    customerId: "cus_204",
    subscriptionId: "sub_204",
    normalizedStatus: "CANCELLED",
    billingAction: "CANCEL_ACCESS",
    amount: null,
    currency: null,
    confidence: 0.95,
    reason: "Cancellation.",
    createdAt: new Date().toISOString(),
  },
  subscriptionState: {
    subscriptionStateId: "sub_state_204",
    subjectId: "cus_204",
    customerId: "cus_204",
    subscriptionId: "sub_204",
    subscriptionState: "cancelled",
    provisioningPosture: "CANCEL",
    continuityEligible: false,
    sourceTruthId: "billing_truth_204",
    reason: "Cancelled subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.humanLegibleEvent !== "cancellation_scheduled") {
  throw new Error("Expected cancellation scheduling normalization.");
}

console.log("SMOKE_HUMAN_LEGIBLE_BILLING_CANCEL=PASS");