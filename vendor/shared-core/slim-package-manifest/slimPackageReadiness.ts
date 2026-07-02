import fs from "fs";
import path from "path";
import {
  SlimPackageManifest,
  SlimPackageManifestItem,
  SlimPackageReadinessResult
} from "./slimPackageContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resolveItemPath(itemPath: string) {
  if (path.isAbsolute(itemPath)) return itemPath;
  return path.join("D:/DEV/AIVA", itemPath);
}

function itemExists(item: SlimPackageManifestItem) {
  return fs.existsSync(resolveItemPath(item.path));
}

export function checkSlimPackageReadiness(
  manifest: SlimPackageManifest
): SlimPackageReadinessResult {
  const checkedItems = manifest.includedItems.map((item) => ({
    ...item,
    exists: itemExists(item)
  }));

  const missingRequiredItems = checkedItems.filter(
    (item) => item.required && item.exists !== true
  );

  const blockedReasons: string[] = [];

  if (!manifest.packageName) blockedReasons.push("PACKAGE_NAME_REQUIRED");
  if (!manifest.summary) blockedReasons.push("PACKAGE_SUMMARY_REQUIRED");
  if (manifest.sourceModules.length === 0) blockedReasons.push("SOURCE_MODULE_REQUIRED");
  if (manifest.includedItems.length === 0) blockedReasons.push("INCLUDED_ITEMS_REQUIRED");
  if (manifest.reviewRequirements.length === 0) blockedReasons.push("REVIEW_REQUIREMENTS_REQUIRED");
  if (missingRequiredItems.length > 0) blockedReasons.push("REQUIRED_ITEMS_MISSING");

  if (manifest.status === "RETIRED") blockedReasons.push("RETIRED_PACKAGE_NOT_READY");
  if (manifest.status === "SUPERSEDED") blockedReasons.push("SUPERSEDED_PACKAGE_NOT_READY");

  const ready = blockedReasons.length === 0;

  return {
    readinessId: id("slim-readiness"),
    packageId: manifest.packageId,
    checkedAt: new Date().toISOString(),
    statusBeforeCheck: manifest.status,
    ready,
    missingRequiredItems,
    blockedReasons,
    nextAllowedStatus: ready ? "READY_FOR_REVIEW" : "REVIEW_HELD",
    authorityBoundary: {
      ...manifest.authorityBoundary,
      readinessIsNotApproval: true,
      readinessIsNotExport: true
    }
  };
}
