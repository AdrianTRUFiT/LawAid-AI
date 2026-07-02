import {
  HODAuthoritySurface,
  HODCapabilityProfile,
  HODCustodyPlane,
  HODDeviceClass,
  HODHardwareAuthorityBoundary,
  HODHardwareProfile,
  HODHardwareProfileStatus,
  HODReadinessPriority
} from "./hodHardwareContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultHODHardwareBoundary(): HODHardwareAuthorityBoundary {
  return {
    hardwareProfileIsNotAuthority: true,
    hardwareProfileIsNotIdentity: true,
    hardwareProfileIsNotDeploymentApproval: true,
    hardwareProfileIsNotRuntimeExecution: true,
    hardwareProfileIsNotSourceTruth: true,
    devicePresenceDoesNotCreatePermission: true,
    localCustodyRequiresGovernedSourceTruth: true
  };
}

export function createHODHardwareProfile(input: {
  deviceName: string;
  deviceClass: HODDeviceClass;
  custodyPlane: HODCustodyPlane;
  authoritySurface: HODAuthoritySurface;
  status?: HODHardwareProfileStatus;
  priority?: HODReadinessPriority;
  intendedUse: string;
  relatedModules?: string[];
  capabilityProfile: HODCapabilityProfile;
  constraints?: string[];
  dependencies?: string[];
  futureTrigger?: string;
}): HODHardwareProfile {
  const now = new Date().toISOString();

  return {
    hardwareProfileId: id("hod-hardware-profile"),
    deviceName: input.deviceName.trim(),
    deviceClass: input.deviceClass,
    custodyPlane: input.custodyPlane,
    authoritySurface: input.authoritySurface,
    status: input.status || "DRAFT",
    priority: input.priority || "MEDIUM",
    intendedUse: input.intendedUse.trim(),
    relatedModules: input.relatedModules || [],
    capabilityProfile: input.capabilityProfile,
    constraints: input.constraints || [],
    dependencies: input.dependencies || [],
    futureTrigger: input.futureTrigger,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultHODHardwareBoundary()
  };
}

export function updateHODHardwareProfileStatus(
  profile: HODHardwareProfile,
  status: HODHardwareProfileStatus
): HODHardwareProfile {
  return {
    ...profile,
    status,
    updatedAt: new Date().toISOString()
  };
}
