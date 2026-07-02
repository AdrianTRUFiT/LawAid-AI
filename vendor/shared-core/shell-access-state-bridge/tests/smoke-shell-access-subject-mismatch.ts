import { runShellAccessStateBridge } from "../src/index.js";

const result = runShellAccessStateBridge({
  subjectId: "wrong_customer",
  entitlement: {
    entitlementId: "entitlement_subscription_state_005",
    subjectId: "cus_005",
    customerId: "cus_005",
    subscriptionId: "sub_005",
    packageId: "pkg_core",
    featureSet: ["workspace"],
    entitlementState: "entitled",
    provisioningAction: "ACTIVATE",
    activationEligible: true,
    continuityEligible: true,
    sourceSubscriptionStateId: "subscription_state_005",
    reason: "Active subscription state bridged into entitled provisioning posture.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_SHELL_ACCESS_SUBJECT_MISMATCH=PASS");