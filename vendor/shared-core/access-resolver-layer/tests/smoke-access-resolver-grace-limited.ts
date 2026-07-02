import { runAccessResolver } from "../src/index.js";

const result = runAccessResolver({
  subjectId: "user_203",
  identityActive: true,
  lifecycleState: "GRACE",
  entitlementPackage: {
    entitlementPackageId: "ent_package_203",
    subjectId: "user_203",
    offerCode: "PAID_CORE",
    offerTerm: "monthly",
    rights: ["core_dashboard", "continuity_view", "full_support", "active_modules"],
    durationDays: 30,
    downgradeRule: "grace_then_past_due_then_downgrade",
    closureRule: "paid_closure_preserves_return_path",
    archiveExportRule: "archive_and_export_available",
    reentryRule: "reactivation_allowed_with_continuity",
    createdAt: new Date().toISOString(),
  },
  shellAccess: {
    shellAccessId: "shell_203",
    subjectId: "user_203",
    customerId: "user_203",
    subscriptionId: "sub_203",
    shellAccessState: "limited_shell",
    shellAccessMode: "LIMITED",
    continuityEligible: false,
    sourceEntitlementId: "ent_203",
    reason: "Limited shell.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessMode !== "LIMITED_ACCESS") {
  throw new Error("Expected grace limited access.");
}

console.log("SMOKE_ACCESS_RESOLVER_GRACE_LIMITED=PASS");