export type SlimPackageStatus =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "REVIEW_HELD"
  | "APPROVED_FOR_EXPORT"
  | "EXPORTED"
  | "RETIRED"
  | "SUPERSEDED";

export type SlimPackageKind =
  | "shared_core_module"
  | "district_app_bundle"
  | "documentation_bundle"
  | "deployment_candidate"
  | "handoff_package"
  | "operator_toolkit"
  | "other";

export type SlimPackagePriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type SlimPackageAuthorityBoundary = {
  packageManifestIsNotDoctrine: true;
  packageManifestIsNotDeploymentApproval: true;
  packageManifestIsNotReleaseAuthorization: true;
  packageManifestIsNotActivationState: true;
  packageManifestIsNotTruthOwner: true;
  exportRequiresAuthorizedReview: true;
};

export type SlimPackageManifestItem = {
  itemId: string;
  path: string;
  itemType:
    | "source_file"
    | "test_file"
    | "script"
    | "report"
    | "config"
    | "ledger"
    | "documentation"
    | "other";
  required: boolean;
  exists?: boolean;
  notes?: string[];
};

export type SlimPackageManifest = {
  packageId: string;
  packageName: string;
  packageKind: SlimPackageKind;
  summary: string;
  status: SlimPackageStatus;
  priority: SlimPackagePriority;
  sourceModules: string[];
  includedItems: SlimPackageManifestItem[];
  dependencies: string[];
  reviewRequirements: string[];
  exportTarget?: string;
  supersedesPackageId?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: SlimPackageAuthorityBoundary;
};

export type SlimPackageReadinessResult = {
  readinessId: string;
  packageId: string;
  checkedAt: string;
  statusBeforeCheck: SlimPackageStatus;
  ready: boolean;
  missingRequiredItems: SlimPackageManifestItem[];
  blockedReasons: string[];
  nextAllowedStatus:
    | "READY_FOR_REVIEW"
    | "REVIEW_HELD"
    | "APPROVED_FOR_EXPORT"
    | "NO_STATUS_CHANGE";
  authorityBoundary: SlimPackageAuthorityBoundary & {
    readinessIsNotApproval: true;
    readinessIsNotExport: true;
  };
};

export type SlimPackageExportGuardResult = {
  exportGuardId: string;
  packageId: string;
  checkedAt: string;
  allowed: boolean;
  reason:
    | "APPROVED_PACKAGE_CAN_BE_EXPORTED"
    | "DRAFT_PACKAGE_CANNOT_EXPORT"
    | "REVIEW_HELD_PACKAGE_CANNOT_EXPORT"
    | "RETIRED_PACKAGE_CANNOT_EXPORT"
    | "SUPERSEDED_PACKAGE_CANNOT_EXPORT"
    | "PACKAGE_NOT_APPROVED_FOR_EXPORT";
  requiredCorrections: string[];
  authorityBoundary: SlimPackageAuthorityBoundary & {
    exportGuardIsNotDeployment: true;
    exportGuardIsNotRelease: true;
  };
};

export type SlimPackageLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "PACKAGE_MANIFEST_CREATED"
    | "PACKAGE_READINESS_CHECKED"
    | "PACKAGE_EXPORT_GUARD_CHECKED";
  packageId: string;
  status: SlimPackageStatus;
  ledgerPath: string;
  notes: string[];
};
