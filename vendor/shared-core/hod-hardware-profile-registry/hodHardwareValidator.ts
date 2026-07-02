import {
  HODHardwareProfile,
  HODHardwareValidationResult
} from "./hodHardwareContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function validateHODHardwareProfile(
  profile: HODHardwareProfile
): HODHardwareValidationResult {
  const blockedReasons: string[] = [];

  if (!profile.deviceName) blockedReasons.push("DEVICE_NAME_REQUIRED");
  if (!profile.intendedUse) blockedReasons.push("INTENDED_USE_REQUIRED");
  if (profile.custodyPlane === "unknown") blockedReasons.push("CUSTODY_PLANE_REQUIRED");
  if (profile.authoritySurface === "unknown") blockedReasons.push("AUTHORITY_SURFACE_REQUIRED");

  if (!profile.capabilityProfile) {
    blockedReasons.push("CAPABILITY_PROFILE_REQUIRED");
  } else {
    if (!profile.capabilityProfile.os) blockedReasons.push("OS_REQUIRED");
    if (!profile.capabilityProfile.networkModes || profile.capabilityProfile.networkModes.length === 0) {
      blockedReasons.push("NETWORK_MODE_REQUIRED");
    }

    if (profile.custodyPlane === "local_custody" || profile.custodyPlane === "hybrid") {
      if (profile.capabilityProfile.supportsLocalCustody !== true) {
        blockedReasons.push("LOCAL_CUSTODY_SUPPORT_REQUIRED");
      }
      if (profile.capabilityProfile.supportsEncryptedStorage !== true) {
        blockedReasons.push("ENCRYPTED_STORAGE_REQUIRED_FOR_CUSTODY");
      }
    }

    if (profile.custodyPlane === "portable_user_container") {
      if (profile.capabilityProfile.supportsPortableContainer !== true) {
        blockedReasons.push("PORTABLE_CONTAINER_SUPPORT_REQUIRED");
      }
    }
  }

  if (profile.status === "RETIRED") blockedReasons.push("RETIRED_PROFILE_NOT_VALID_FOR_USE");
  if (profile.status === "SUPERSEDED") blockedReasons.push("SUPERSEDED_PROFILE_NOT_VALID_FOR_USE");

  const valid = blockedReasons.length === 0;

  return {
    validationId: id("hod-hardware-validation"),
    hardwareProfileId: profile.hardwareProfileId,
    checkedAt: new Date().toISOString(),
    valid,
    blockedReasons,
    nextAllowedStatus: valid ? "PROFILE_READY" : "PROFILE_HELD",
    authorityBoundary: {
      ...profile.authorityBoundary,
      validationIsNotApproval: true,
      validationIsNotRuntimeUse: true
    }
  };
}
