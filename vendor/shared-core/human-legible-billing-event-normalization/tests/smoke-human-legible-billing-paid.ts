import { runHumanLegibleBillingEventNormalization } from "../src/index.js";

const result = runHumanLegibleBillingEventNormalization({
  subjectId: "cus_201",
  billingTruth: {
    truthId: "billing_truth_201",
    sourceEventId: "evt_201",
    customerId: "cus_201",
    subscriptionId: "sub_201",
    normalizedStatus: "ACTIVE",
    billingAction: "PROVISION_OK",
    amount: 4900,
    currency: "USD",
    confidence: 0.95,
    reason: "Active billing truth.",
    createdAt: new Date().toISOString(),
  },
  subscriptionState: {
    subscriptionStateId: "sub_state_201",
    subjectId: "cus_201",
    customerId: "cus_201",
    subscriptionId: "sub_201",
    subscriptionState: "active",
    provisioningPosture: "ALLOW",
    continuityEligible: true,
    sourceTruthId: "billing_truth_201",
    reason: "Active subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.humanLegibleEvent !== "paid_activated") {
  throw new Error("Expected paid activation normalization.");
}

console.log("SMOKE_HUMAN_LEGIBLE_BILLING_PAID=PASS");