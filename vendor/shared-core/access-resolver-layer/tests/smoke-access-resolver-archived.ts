import { runAccessResolver } from "../src/index.js";

const result = runAccessResolver({
  subjectId: "user_204",
  identityActive: true,
  lifecycleState: "ARCHIVED",
  entitlementPackage: {
    entitlementPackageId: "ent_package_204",
    subjectId: "user_204",
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
    shellAccessId: "shell_204",
    subjectId: "user_204",
    customerId: "user_204",
    subscriptionId: "sub_204",
    shellAccessState: "revoked_shell",
    shellAccessMode: "REVOKED",
    continuityEligible: false,
    sourceEntitlementId: "ent_204",
    reason: "Archived shell.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessMode !== "ARCHIVED_ACCESS" || result.artifact.returnPathEligible !== true) {
  throw new Error("Expected archived access.");
}

console.log("SMOKE_ACCESS_RESOLVER_ARCHIVED=PASS");