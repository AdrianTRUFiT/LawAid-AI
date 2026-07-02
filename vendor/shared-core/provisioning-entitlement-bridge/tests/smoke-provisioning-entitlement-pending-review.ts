import { runProvisioningEntitlementBridge } from "../src/index.js";

const result = runProvisioningEntitlementBridge({
  subjectId: "cus_004",
  packageId: "pkg_core",
  featureSet: ["workspace"],
  subscriptionState: {
    subscriptionStateId: "subscription_state_billing_truth_evt_004",
    subjectId: "cus_004",
    customerId: "cus_004",
    subscriptionId: "sub_004",
    subscriptionState: "pending_review",
    provisioningPosture: "REVIEW",
    continuityEligible: false,
    sourceTruthId: "billing_truth_evt_004",
    reason: "Pending billing truth bridged into review-required subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementState !== "review_required" || result.artifact.provisioningAction !== "REVIEW") {
  throw new Error("Expected review-required provisioning state.");
}

console.log("SMOKE_PROVISIONING_ENTITLEMENT_PENDING_REVIEW=PASS");