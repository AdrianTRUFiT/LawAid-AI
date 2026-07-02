import { runShellAccessStateBridge } from "../src/index.js";

const result = runShellAccessStateBridge({
  subjectId: "cus_003",
  entitlement: {
    entitlementId: "entitlement_subscription_state_003",
    subjectId: "cus_003",
    customerId: "cus_003",
    subscriptionId: "sub_003",
    packageId: "pkg_core",
    featureSet: ["workspace"],
    entitlementState: "review_required",
    provisioningAction: "REVIEW",
    activationEligible: false,
    continuityEligible: false,
    sourceSubscriptionStateId: "subscription_state_003",
    reason: "Pending-review subscription state bridged into review-required entitlement posture.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.shellAccessState !== "review_shell" || result.artifact.shellAccessMode !== "REVIEW") {
  throw new Error("Expected review shell access.");
}

console.log("SMOKE_SHELL_ACCESS_REVIEW=PASS");