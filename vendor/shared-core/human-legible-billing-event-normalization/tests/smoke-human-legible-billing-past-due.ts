import { runHumanLegibleBillingEventNormalization } from "../src/index.js";

const result = runHumanLegibleBillingEventNormalization({
  subjectId: "cus_203",
  billingTruth: {
    truthId: "billing_truth_203",
    sourceEventId: "evt_203",
    customerId: "cus_203",
    subscriptionId: "sub_203",
    normalizedStatus: "PAST_DUE",
    billingAction: "HOLD_PROVISION",
    amount: 4900,
    currency: "USD",
    confidence: 0.9,
    reason: "Past due.",
    createdAt: new Date().toISOString(),
  },
  subscriptionState: {
    subscriptionStateId: "sub_state_203",
    subjectId: "cus_203",
    customerId: "cus_203",
    subscriptionId: "sub_203",
    subscriptionState: "past_due",
    provisioningPosture: "HOLD",
    continuityEligible: false,
    sourceTruthId: "billing_truth_203",
    reason: "Past due subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.humanLegibleEvent !== "past_due_detected") {
  throw new Error("Expected past-due normalization.");
}

console.log("SMOKE_HUMAN_LEGIBLE_BILLING_PAST_DUE=PASS");