import { runShellAccessStateBridge } from "../src/index.js";

const result = runShellAccessStateBridge({
  subjectId: "cus_002",
  entitlement: {
    entitlementId: "entitlement_subscription_state_002",
    subjectId: "cus_002",
    customerId: "cus_002",
    subscriptionId: "sub_002",
    packageId: "pkg_core",
    featureSet: ["workspace"],
    entitlementState: "held",
    provisioningAction: "HOLD",
    activationEligible: false,
    continuityEligible: false,
    sourceSubscriptionStateId: "subscription_state_002",
    reason: "Past-due subscription state bridged into held provisioning posture.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.shellAccessState !== "limited_shell" || result.artifact.shellAccessMode !== "LIMITED") {
  throw new Error("Expected limited shell access.");
}

console.log("SMOKE_SHELL_ACCESS_LIMITED=PASS");