import { runProvisioningEntitlementBridge } from "../src/index.js";

const result = runProvisioningEntitlementBridge({
  subjectId: "cus_002",
  packageId: "pkg_core",
  featureSet: ["workspace"],
  subscriptionState: {
    subscriptionStateId: "subscription_state_billing_truth_evt_002",
    subjectId: "cus_002",
    customerId: "cus_002",
    subscriptionId: "sub_002",
    subscriptionState: "past_due",
    provisioningPosture: "HOLD",
    continuityEligible: false,
    sourceTruthId: "billing_truth_evt_002",
    reason: "Past-due billing truth bridged into held subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementState !== "held" || result.artifact.provisioningAction !== "HOLD") {
  throw new Error("Expected held provisioning state.");
}

console.log("SMOKE_PROVISIONING_ENTITLEMENT_PAST_DUE=PASS");