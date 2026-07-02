import { runHumanLegibleBillingEventNormalization } from "../src/index.js";

const result = runHumanLegibleBillingEventNormalization({
  subjectId: "cus_202",
  billingTruth: {
    truthId: "billing_truth_202",
    sourceEventId: "evt_202",
    customerId: "cus_202",
    subscriptionId: "sub_202",
    normalizedStatus: "REFUSED",
    billingAction: "HOLD_PROVISION",
    amount: 4900,
    currency: "USD",
    confidence: 0.8,
    reason: "Refused financial path.",
    createdAt: new Date().toISOString(),
  },
  subscriptionState: {
    subscriptionStateId: "sub_state_202",
    subjectId: "cus_202",
    customerId: "cus_202",
    subscriptionId: "sub_202",
    subscriptionState: "suspended",
    provisioningPosture: "BLOCK",
    continuityEligible: false,
    sourceTruthId: "billing_truth_202",
    reason: "Suspended subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.resolvedLifecycleState !== "GRACE") {
  throw new Error("Expected grace entry normalization.");
}

console.log("SMOKE_HUMAN_LEGIBLE_BILLING_GRACE=PASS");