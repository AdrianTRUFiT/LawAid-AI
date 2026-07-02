import { runAccessResolver } from "../src/index.js";

const result = runAccessResolver({
  subjectId: "user_201",
  identityActive: true,
  lifecycleState: "ACTIVE_PAID",
  entitlementPackage: {
    entitlementPackageId: "ent_package_201",
    subjectId: "user_201",
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
    shellAccessId: "shell_201",
    subjectId: "user_201",
    customerId: "user_201",
    subscriptionId: "sub_201",
    shellAccessState: "active_shell",
    shellAccessMode: "FULL",
    continuityEligible: true,
    sourceEntitlementId: "ent_201",
    reason: "Full shell.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessMode !== "FULL_ACCESS") {
  throw new Error("Expected active paid full access.");
}

console.log("SMOKE_ACCESS_RESOLVER_ACTIVE_PAID=PASS");