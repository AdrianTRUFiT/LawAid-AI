import { runProvisioningEntitlementBridge } from "../src/index.js";

const result = runProvisioningEntitlementBridge({
  subjectId: "cus_003",
  packageId: "pkg_core",
  featureSet: ["workspace"],
  subscriptionState: {
    subscriptionStateId: "subscription_state_billing_truth_evt_003",
    subjectId: "cus_003",
    customerId: "cus_003",
    subscriptionId: "sub_003",
    subscriptionState: "cancelled",
    provisioningPosture: "CANCEL",
    continuityEligible: false,
    sourceTruthId: "billing_truth_evt_003",
    reason: "Cancelled billing truth bridged into cancelled subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementState !== "revoked" || result.artifact.provisioningAction !== "REVOKE") {
  throw new Error("Expected revoked provisioning state.");
}

console.log("SMOKE_PROVISIONING_ENTITLEMENT_CANCELLED=PASS");