import { runAccessResolver } from "../src/index.js";

const result = runAccessResolver({
  subjectId: "user_205",
  identityActive: true,
  lifecycleState: "ACTIVE_PAID",
  entitlementPackage: null,
  shellAccess: {
    shellAccessId: "shell_205",
    subjectId: "user_205",
    customerId: "user_205",
    subscriptionId: "sub_205",
    shellAccessState: "active_shell",
    shellAccessMode: "FULL",
    continuityEligible: true,
    sourceEntitlementId: "ent_205",
    reason: "Active shell.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "NO_ENTITLEMENT") {
  throw new Error("Expected no-entitlement refusal.");
}

console.log("SMOKE_ACCESS_RESOLVER_NO_ENTITLEMENT=PASS");