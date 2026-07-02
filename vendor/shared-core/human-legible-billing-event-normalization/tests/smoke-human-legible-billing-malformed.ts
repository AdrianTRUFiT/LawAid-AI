import { runHumanLegibleBillingEventNormalization } from "../src/index.js";

const result = runHumanLegibleBillingEventNormalization({
  subjectId: "cus_205",
  billingTruth: {
    truthId: "billing_truth_205",
    sourceEventId: "evt_205",
    customerId: "wrong_customer",
    subscriptionId: "sub_205",
    normalizedStatus: "ACTIVE",
    billingAction: "PROVISION_OK",
    amount: 4900,
    currency: "USD",
    confidence: 0.9,
    reason: "Bad input.",
    createdAt: new Date().toISOString(),
  },
  subscriptionState: {
    subscriptionStateId: "sub_state_205",
    subjectId: "cus_205",
    customerId: "cus_205",
    subscriptionId: "sub_205",
    subscriptionState: "active",
    provisioningPosture: "ALLOW",
    continuityEligible: true,
    sourceTruthId: "billing_truth_205",
    reason: "Active subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject-mismatch refusal.");
}

console.log("SMOKE_HUMAN_LEGIBLE_BILLING_MALFORMED=PASS");