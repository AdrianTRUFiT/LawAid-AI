import { runShellAccessStateBridge } from "../src/index.js";

const result = runShellAccessStateBridge({
  subjectId: "cus_001",
  entitlement: {
    entitlementId: "entitlement_subscription_state_001",
    subjectId: "cus_001",
    customerId: "cus_001",
    subscriptionId: "sub_001",
    packageId: "pkg_core",
    featureSet: ["workspace", "timeline"],
    entitlementState: "entitled",
    provisioningAction: "ACTIVATE",
    activationEligible: true,
    continuityEligible: true,
    sourceSubscriptionStateId: "subscription_state_001",
    reason: "Active subscription state bridged into entitled provisioning posture.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.shellAccessState !== "active_shell" || result.artifact.shellAccessMode !== "FULL") {
  throw new Error("Expected active shell access.");
}

console.log("SMOKE_SHELL_ACCESS_ACTIVE=PASS");