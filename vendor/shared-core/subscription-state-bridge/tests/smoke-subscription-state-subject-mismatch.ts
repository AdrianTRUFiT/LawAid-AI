import { runSubscriptionStateBridge } from "../src/index.js";

const result = runSubscriptionStateBridge({
  subjectId: "wrong_customer",
  billingTruth: {
    truthId: "billing_truth_evt_005",
    sourceEventId: "evt_005",
    customerId: "cus_005",
    subscriptionId: "sub_005",
    normalizedStatus: "ACTIVE",
    billingAction: "PROVISION_OK",
    amount: 4900,
    currency: "USD",
    confidence: 0.9,
    reason: "Billing event normalized into active subscription truth.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_SUBSCRIPTION_STATE_SUBJECT_MISMATCH=PASS");