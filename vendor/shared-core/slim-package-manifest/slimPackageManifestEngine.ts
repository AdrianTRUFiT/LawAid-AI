import {
  SlimPackageAuthorityBoundary,
  SlimPackageManifest,
  SlimPackagePriority,
  SlimPackageKind,
  SlimPackageManifestItem,
  SlimPackageStatus
} from "./slimPackageContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultSlimAuthorityBoundary(): SlimPackageAuthorityBoundary {
  return {
    packageManifestIsNotDoctrine: true,
    packageManifestIsNotDeploymentApproval: true,
    packageManifestIsNotReleaseAuthorization: true,
    packageManifestIsNotActivationState: true,
    packageManifestIsNotTruthOwner: true,
    exportRequiresAuthorizedReview: true
  };
}

export function createSlimPackageManifest(input: {
  packageName: string;
  packageKind: SlimPackageKind;
  summary: string;
  status?: SlimPackageStatus;
  priority?: SlimPackagePriority;
  sourceModules?: string[];
  includedItems?: SlimPackageManifestItem[];
  dependencies?: string[];
  reviewRequirements?: string[];
  exportTarget?: string;
  supersedesPackageId?: string;
}): SlimPackageManifest {
  const now = new Date().toISOString();

  return {
    packageId: id("slim-package"),
    packageName: input.packageName.trim(),
    packageKind: input.packageKind,
    summary: input.summary.trim(),
    status: input.status || "DRAFT",
    priority: input.priority || "MEDIUM",
    sourceModules: input.sourceModules || [],
    includedItems: input.includedItems || [],
    dependencies: input.dependencies || [],
    reviewRequirements: input.reviewRequirements || [],
    exportTarget: input.exportTarget,
    supersedesPackageId: input.supersedesPackageId,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultSlimAuthorityBoundary()
  };
}

export function updateSlimPackageStatus(
  manifest: SlimPackageManifest,
  status: SlimPackageStatus
): SlimPackageManifest {
  return {
    ...manifest,
    status,
    updatedAt: new Date().toISOString()
  };
}
