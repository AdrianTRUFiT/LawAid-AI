import { runShellAccessStateBridge } from "../src/index.js";

const result = runShellAccessStateBridge({
  subjectId: "cus_004",
  entitlement: {
    entitlementId: "entitlement_subscription_state_004",
    subjectId: "cus_004",
    customerId: "cus_004",
    subscriptionId: "sub_004",
    packageId: "pkg_core",
    featureSet: ["workspace"],
    entitlementState: "revoked",
    provisioningAction: "REVOKE",
    activationEligible: false,
    continuityEligible: false,
    sourceSubscriptionStateId: "subscription_state_004",
    reason: "Cancelled subscription state bridged into revoked entitlement posture.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.shellAccessState !== "revoked_shell" || result.artifact.shellAccessMode !== "REVOKED") {
  throw new Error("Expected revoked shell access.");
}

console.log("SMOKE_SHELL_ACCESS_REVOKED=PASS");