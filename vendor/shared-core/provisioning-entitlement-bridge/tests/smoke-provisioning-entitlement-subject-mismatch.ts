import { runProvisioningEntitlementBridge } from "../src/index.js";

const result = runProvisioningEntitlementBridge({
  subjectId: "wrong_customer",
  packageId: "pkg_core",
  featureSet: ["workspace"],
  subscriptionState: {
    subscriptionStateId: "subscription_state_billing_truth_evt_005",
    subjectId: "cus_005",
    customerId: "cus_005",
    subscriptionId: "sub_005",
    subscriptionState: "active",
    provisioningPosture: "ALLOW",
    continuityEligible: true,
    sourceTruthId: "billing_truth_evt_005",
    reason: "Active billing truth bridged into active subscription state.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_PROVISIONING_ENTITLEMENT_SUBJECT_MISMATCH=PASS");