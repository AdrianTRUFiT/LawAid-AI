import { runAccessResolver } from "../src/index.js";

const result = runAccessResolver({
  subjectId: "user_202",
  identityActive: true,
  lifecycleState: "ACTIVE_TRIAL",
  entitlementPackage: {
    entitlementPackageId: "ent_package_202",
    subjectId: "user_202",
    offerCode: "TRIAL_CORE",
    offerTerm: "trial_14d",
    rights: ["core_dashboard", "continuity_view", "limited_support"],
    durationDays: 14,
    downgradeRule: "trial_to_limited_or_expired",
    closureRule: "trial_closes_without_paid_extension",
    archiveExportRule: "summary_export_only",
    reentryRule: "paid_conversion_or_reactivation_offer",
    createdAt: new Date().toISOString(),
  },
  shellAccess: {
    shellAccessId: "shell_202",
    subjectId: "user_202",
    customerId: "user_202",
    subscriptionId: "sub_202",
    shellAccessState: "active_shell",
    shellAccessMode: "FULL",
    continuityEligible: true,
    sourceEntitlementId: "ent_202",
    reason: "Trial shell.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessMode !== "TRIAL_ACCESS") {
  throw new Error("Expected trial access.");
}

console.log("SMOKE_ACCESS_RESOLVER_TRIAL=PASS");