import {
  HODHardwareProfile,
  HODHardwareUseGuardResult
} from "./hodHardwareContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkHODHardwareUseGuard(
  profile: HODHardwareProfile
): HODHardwareUseGuardResult {
  const boundary = {
    ...profile.authorityBoundary,
    useGuardIsNotExecution: true as const,
    useGuardIsNotDeployment: true as const,
    useGuardIsNotIdentityAuthority: true as const
  };

  if (profile.status === "DRAFT") {
    return {
      useGuardId: id("hod-use-guard"),
      hardwareProfileId: profile.hardwareProfileId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "DRAFT_PROFILE_CANNOT_BE_USED",
      requiredCorrections: ["MOVE_PROFILE_TO_REVIEW_AND_APPROVAL_BEFORE_LOCAL_USE"],
      authorityBoundary: boundary
    };
  }

  if (profile.status === "PROFILE_HELD") {
    return {
      useGuardId: id("hod-use-guard"),
      hardwareProfileId: profile.hardwareProfileId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "HELD_PROFILE_CANNOT_BE_USED",
      requiredCorrections: ["RESOLVE_PROFILE_HOLD_BEFORE_LOCAL_USE"],
      authorityBoundary: boundary
    };
  }

  if (profile.status === "RETIRED") {
    return {
      useGuardId: id("hod-use-guard"),
      hardwareProfileId: profile.hardwareProfileId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "RETIRED_PROFILE_CANNOT_BE_USED",
      requiredCorrections: ["CREATE_OR_SELECT_CURRENT_HARDWARE_PROFILE"],
      authorityBoundary: boundary
    };
  }

  if (profile.status === "SUPERSEDED") {
    return {
      useGuardId: id("hod-use-guard"),
      hardwareProfileId: profile.hardwareProfileId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "SUPERSEDED_PROFILE_CANNOT_BE_USED",
      requiredCorrections: ["USE_CURRENT_HARDWARE_PROFILE"],
      authorityBoundary: boundary
    };
  }

  if (profile.status === "APPROVED_FOR_LOCAL_USE") {
    return {
      useGuardId: id("hod-use-guard"),
      hardwareProfileId: profile.hardwareProfileId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_HARDWARE_PROFILE_CAN_SURFACE_FOR_LOCAL_USE",
      requiredCorrections: [],
      authorityBoundary: boundary
    };
  }

  return {
    useGuardId: id("hod-use-guard"),
    hardwareProfileId: profile.hardwareProfileId,
    checkedAt: new Date().toISOString(),
    allowed: false,
    reason: "PROFILE_NOT_APPROVED_FOR_LOCAL_USE",
    requiredCorrections: ["APPROVED_FOR_LOCAL_USE_STATUS_REQUIRED"],
    authorityBoundary: boundary
  };
}
