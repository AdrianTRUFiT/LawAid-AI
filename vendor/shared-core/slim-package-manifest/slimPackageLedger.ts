import fs from "fs";
import path from "path";
import {
  SlimPackageLedgerEntry,
  SlimPackageManifest,
  SlimPackageReadinessResult,
  SlimPackageExportGuardResult
} from "./slimPackageContracts";

const LEDGER_DIR = "D:/DEV/AIVA/shared-data/slim-package-manifest";
const LEDGER_PATH = path.join(LEDGER_DIR, "slim-package-manifest-ledger.jsonl");

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function appendJsonl(value: unknown) {
  fs.mkdirSync(LEDGER_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(value) + "\n", "utf8");
}

export function recordSlimPackageCreated(
  manifest: SlimPackageManifest
): SlimPackageLedgerEntry {
  const entry: SlimPackageLedgerEntry = {
    ledgerEntryId: id("slim-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PACKAGE_MANIFEST_CREATED",
    packageId: manifest.packageId,
    status: manifest.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      "SLiM package manifest created.",
      "Package manifest is not doctrine, deployment approval, release authorization, or activation state."
    ]
  };

  appendJsonl({ manifest, entry });
  return entry;
}

export function recordSlimPackageReadiness(
  manifest: SlimPackageManifest,
  result: SlimPackageReadinessResult
): SlimPackageLedgerEntry {
  const entry: SlimPackageLedgerEntry = {
    ledgerEntryId: id("slim-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PACKAGE_READINESS_CHECKED",
    packageId: manifest.packageId,
    status: manifest.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Readiness: ${result.ready}`,
      `Blocked reasons: ${result.blockedReasons.join(", ") || "None"}`,
      "Readiness is not approval.",
      "Readiness is not export."
    ]
  };

  appendJsonl({ manifest, result, entry });
  return entry;
}

export function recordSlimPackageExportGuard(
  manifest: SlimPackageManifest,
  result: SlimPackageExportGuardResult
): SlimPackageLedgerEntry {
  const entry: SlimPackageLedgerEntry = {
    ledgerEntryId: id("slim-ledger"),
    createdAt: new Date().toISOString(),
    eventType: "PACKAGE_EXPORT_GUARD_CHECKED",
    packageId: manifest.packageId,
    status: manifest.status,
    ledgerPath: LEDGER_PATH,
    notes: [
      `Export allowed: ${result.allowed}`,
      `Export reason: ${result.reason}`,
      "Export guard is not deployment.",
      "Export guard is not release."
    ]
  };

  appendJsonl({ manifest, result, entry });
  return entry;
}

export function getSlimPackageLedgerPath() {
  return LEDGER_PATH;
}
