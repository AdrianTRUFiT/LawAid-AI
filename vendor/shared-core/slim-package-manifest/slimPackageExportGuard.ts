import {
  SlimPackageExportGuardResult,
  SlimPackageManifest
} from "./slimPackageContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkSlimPackageExportGuard(
  manifest: SlimPackageManifest
): SlimPackageExportGuardResult {
  const baseBoundary = {
    ...manifest.authorityBoundary,
    exportGuardIsNotDeployment: true as const,
    exportGuardIsNotRelease: true as const
  };

  if (manifest.status === "DRAFT") {
    return {
      exportGuardId: id("slim-export-guard"),
      packageId: manifest.packageId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "DRAFT_PACKAGE_CANNOT_EXPORT",
      requiredCorrections: ["MOVE_TO_REVIEW_AND_APPROVAL_BEFORE_EXPORT"],
      authorityBoundary: baseBoundary
    };
  }

  if (manifest.status === "REVIEW_HELD") {
    return {
      exportGuardId: id("slim-export-guard"),
      packageId: manifest.packageId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "REVIEW_HELD_PACKAGE_CANNOT_EXPORT",
      requiredCorrections: ["RESOLVE_REVIEW_HOLD_BEFORE_EXPORT"],
      authorityBoundary: baseBoundary
    };
  }

  if (manifest.status === "RETIRED") {
    return {
      exportGuardId: id("slim-export-guard"),
      packageId: manifest.packageId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "RETIRED_PACKAGE_CANNOT_EXPORT",
      requiredCorrections: ["CREATE_NEW_PACKAGE_MANIFEST"],
      authorityBoundary: baseBoundary
    };
  }

  if (manifest.status === "SUPERSEDED") {
    return {
      exportGuardId: id("slim-export-guard"),
      packageId: manifest.packageId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "SUPERSEDED_PACKAGE_CANNOT_EXPORT",
      requiredCorrections: ["USE_CURRENT_PACKAGE_MANIFEST"],
      authorityBoundary: baseBoundary
    };
  }

  if (manifest.status === "APPROVED_FOR_EXPORT") {
    return {
      exportGuardId: id("slim-export-guard"),
      packageId: manifest.packageId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_PACKAGE_CAN_BE_EXPORTED",
      requiredCorrections: [],
      authorityBoundary: baseBoundary
    };
  }

  return {
    exportGuardId: id("slim-export-guard"),
    packageId: manifest.packageId,
    checkedAt: new Date().toISOString(),
    allowed: false,
    reason: "PACKAGE_NOT_APPROVED_FOR_EXPORT",
    requiredCorrections: ["AUTHORIZED_EXPORT_APPROVAL_REQUIRED"],
    authorityBoundary: baseBoundary
  };
}
