export type HODHardwareProfileStatus =
  | "DRAFT"
  | "PROFILE_READY"
  | "PROFILE_HELD"
  | "APPROVED_FOR_LOCAL_USE"
  | "ACTIVE"
  | "RETIRED"
  | "SUPERSEDED";

export type HODDeviceClass =
  | "desktop"
  | "laptop"
  | "server"
  | "mobile"
  | "tablet"
  | "edge_device"
  | "storage_device"
  | "other";

export type HODCustodyPlane =
  | "local_custody"
  | "portable_user_container"
  | "cloud_control_plane"
  | "hybrid"
  | "unknown";

export type HODAuthoritySurface =
  | "desktop_authority_surface"
  | "mobile_presence_surface"
  | "server_runtime_surface"
  | "storage_custody_surface"
  | "control_plane_surface"
  | "unknown";

export type HODReadinessPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type HODHardwareAuthorityBoundary = {
  hardwareProfileIsNotAuthority: true;
  hardwareProfileIsNotIdentity: true;
  hardwareProfileIsNotDeploymentApproval: true;
  hardwareProfileIsNotRuntimeExecution: true;
  hardwareProfileIsNotSourceTruth: true;
  devicePresenceDoesNotCreatePermission: true;
  localCustodyRequiresGovernedSourceTruth: true;
};

export type HODCapabilityProfile = {
  cpu?: string;
  memoryGb?: number;
  storageGb?: number;
  gpu?: string;
  os?: string;
  networkModes: string[];
  supportsLocalCustody: boolean;
  supportsPortableContainer: boolean;
  supportsOfflineOperation: boolean;
  supportsEncryptedStorage: boolean;
  notes?: string[];
};

export type HODHardwareProfile = {
  hardwareProfileId: string;
  deviceName: string;
  deviceClass: HODDeviceClass;
  custodyPlane: HODCustodyPlane;
  authoritySurface: HODAuthoritySurface;
  status: HODHardwareProfileStatus;
  priority: HODReadinessPriority;
  intendedUse: string;
  relatedModules: string[];
  capabilityProfile: HODCapabilityProfile;
  constraints: string[];
  dependencies: string[];
  futureTrigger?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: HODHardwareAuthorityBoundary;
};

export type HODHardwareValidationResult = {
  validationId: string;
  hardwareProfileId: string;
  checkedAt: string;
  valid: boolean;
  blockedReasons: string[];
  nextAllowedStatus:
    | "PROFILE_READY"
    | "PROFILE_HELD"
    | "NO_STATUS_CHANGE";
  authorityBoundary: HODHardwareAuthorityBoundary & {
    validationIsNotApproval: true;
    validationIsNotRuntimeUse: true;
  };
};

export type HODHardwareUseGuardResult = {
  useGuardId: string;
  hardwareProfileId: string;
  checkedAt: string;
  allowed: boolean;
  reason:
    | "APPROVED_HARDWARE_PROFILE_CAN_SURFACE_FOR_LOCAL_USE"
    | "DRAFT_PROFILE_CANNOT_BE_USED"
    | "HELD_PROFILE_CANNOT_BE_USED"
    | "RETIRED_PROFILE_CANNOT_BE_USED"
    | "SUPERSEDED_PROFILE_CANNOT_BE_USED"
    | "PROFILE_NOT_APPROVED_FOR_LOCAL_USE";
  requiredCorrections: string[];
  authorityBoundary: HODHardwareAuthorityBoundary & {
    useGuardIsNotExecution: true;
    useGuardIsNotDeployment: true;
    useGuardIsNotIdentityAuthority: true;
  };
};

export type HODHardwareLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "HARDWARE_PROFILE_REGISTERED"
    | "HARDWARE_PROFILE_VALIDATED"
    | "HARDWARE_USE_GUARD_CHECKED";
  hardwareProfileId: string;
  status: HODHardwareProfileStatus;
  ledgerPath: string;
  notes: string[];
};
