import { runProvisioningEntitlementBridge } from "../src/index.js";

const result = runProvisioningEntitlementBridge({
  subjectId: "cus_001",
  packageId: "pkg_core",
  featureSet: ["workspace", "timeline", "messages"],
  subscriptionState: {
    subscriptionStateId: "subscription_state_billing_truth_evt_001",
    subjectId: "cus_001",
    customerId: "cus_001",
    subscriptionId: "sub_001",
    subscriptionState: "active",
    provisioningPosture: "ALLOW",
    continuityEligible: true,
    sourceTruthId: "billing_truth_evt_001",
    reason: "Active billing truth bridged into active subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementState !== "entitled" || result.artifact.provisioningAction !== "ACTIVATE" || result.artifact.activationEligible !== true) {
  throw new Error("Expected entitled provisioning state.");
}

console.log("SMOKE_PROVISIONING_ENTITLEMENT_ACTIVE=PASS");