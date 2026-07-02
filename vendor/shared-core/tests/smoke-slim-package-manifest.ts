import fs from "fs";
import {
  checkSlimPackageExportGuard,
  checkSlimPackageReadiness,
  createSlimPackageManifest,
  getSlimPackageLedgerPath,
  recordSlimPackageCreated,
  recordSlimPackageExportGuard,
  recordSlimPackageReadiness,
  updateSlimPackageStatus
} from "../slim-package-manifest";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const draftPackage = createSlimPackageManifest({
  packageName: "Strategic Opportunity Registry Package",
  packageKind: "shared_core_module",
  summary: "Manifest for the Strategic Opportunity Registry shared-core module.",
  status: "DRAFT",
  priority: "HIGH",
  sourceModules: ["shared-core/strategic-opportunity-registry"],
  includedItems: [
    {
      itemId: "contracts",
      path: "shared-core/strategic-opportunity-registry/strategicOpportunityContracts.ts",
      itemType: "source_file",
      required: true
    },
    {
      itemId: "engine",
      path: "shared-core/strategic-opportunity-registry/strategicOpportunityEngine.ts",
      itemType: "source_file",
      required: true
    },
    {
      itemId: "smoke",
      path: "shared-core/tests/smoke-strategic-opportunity-registry.ts",
      itemType: "test_file",
      required: true
    }
  ],
  dependencies: ["typescript", "tsx"],
  reviewRequirements: [
    "Confirm manifest describes package contents only.",
    "Confirm manifest does not authorize deployment.",
    "Confirm package status is reviewed before export."
  ],
  exportTarget: "operator-review"
});

recordSlimPackageCreated(draftPackage);

assert(draftPackage.authorityBoundary.packageManifestIsNotDoctrine === true, "Package manifest is not doctrine");
assert(draftPackage.authorityBoundary.packageManifestIsNotDeploymentApproval === true, "Package manifest is not deployment approval");
assert(draftPackage.authorityBoundary.packageManifestIsNotReleaseAuthorization === true, "Package manifest is not release authorization");
assert(draftPackage.authorityBoundary.packageManifestIsNotActivationState === true, "Package manifest is not activation state");

const readiness = checkSlimPackageReadiness(draftPackage);
recordSlimPackageReadiness(draftPackage, readiness);

assert(readiness.ready === true, "Complete package manifest can become review-ready");
assert(readiness.nextAllowedStatus === "READY_FOR_REVIEW", "Ready package points to review status");
assert(readiness.authorityBoundary.readinessIsNotApproval === true, "Readiness is not approval");
assert(readiness.authorityBoundary.readinessIsNotExport === true, "Readiness is not export");

const draftExport = checkSlimPackageExportGuard(draftPackage);
recordSlimPackageExportGuard(draftPackage, draftExport);

assert(draftExport.allowed === false, "Draft package cannot export");
assert(draftExport.reason === "DRAFT_PACKAGE_CANNOT_EXPORT", "Draft export refusal reason is correct");

const approvedPackage = updateSlimPackageStatus(draftPackage, "APPROVED_FOR_EXPORT");
const approvedExport = checkSlimPackageExportGuard(approvedPackage);
recordSlimPackageExportGuard(approvedPackage, approvedExport);

assert(approvedExport.allowed === true, "Approved package can be exported");
assert(approvedExport.reason === "APPROVED_PACKAGE_CAN_BE_EXPORTED", "Approved export reason is correct");
assert(approvedExport.authorityBoundary.exportGuardIsNotDeployment === true, "Export guard is not deployment");
assert(approvedExport.authorityBoundary.exportGuardIsNotRelease === true, "Export guard is not release");

const supersededPackage = updateSlimPackageStatus(draftPackage, "SUPERSEDED");
const supersededExport = checkSlimPackageExportGuard(supersededPackage);
recordSlimPackageExportGuard(supersededPackage, supersededExport);

assert(supersededExport.allowed === false, "Superseded package cannot export");
assert(supersededExport.reason === "SUPERSEDED_PACKAGE_CANNOT_EXPORT", "Superseded package refusal reason is correct");

const incompletePackage = createSlimPackageManifest({
  packageName: "Incomplete Package",
  packageKind: "handoff_package",
  summary: "Incomplete package should be held for review.",
  status: "DRAFT",
  sourceModules: [],
  includedItems: [
    {
      itemId: "missing-required-file",
      path: "shared-core/slim-package-manifest/does-not-exist.ts",
      itemType: "source_file",
      required: true
    }
  ],
  dependencies: [],
  reviewRequirements: []
});

const incompleteReadiness = checkSlimPackageReadiness(incompletePackage);
recordSlimPackageReadiness(incompletePackage, incompleteReadiness);

assert(incompleteReadiness.ready === false, "Incomplete package is not ready");
assert(incompleteReadiness.blockedReasons.includes("SOURCE_MODULE_REQUIRED"), "Incomplete package requires source module");
assert(incompleteReadiness.blockedReasons.includes("REVIEW_REQUIREMENTS_REQUIRED"), "Incomplete package requires review requirements");
assert(incompleteReadiness.blockedReasons.includes("REQUIRED_ITEMS_MISSING"), "Incomplete package detects missing required item");

const ledgerPath = getSlimPackageLedgerPath();
assert(fs.existsSync(ledgerPath), "SLiM ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "SLiM ledger contains entries");

console.log("");
console.log("SLIM_PACKAGE_MANIFEST_SMOKE=PASS");









