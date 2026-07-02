import { ARTIFACT_TYPES, isKnownArtifactType } from "./artifactTypes.mjs";
import { MODULE_AUTHORITY } from "./moduleAuthority.mjs";

export const ARTIFACT_PLACEMENT = {
  [ARTIFACT_TYPES.RAW_SIGNAL]: {
    owner: "DICE",
    storageHint: "RATE/DICE/records/raw-signals",
    nextAllowedModule: "DICE"
  },
  [ARTIFACT_TYPES.CAPTURED_SIGNAL]: {
    owner: "DICE",
    storageHint: "RATE/DICE/records/captured-signals",
    nextAllowedModule: "AIOP"
  },
  [ARTIFACT_TYPES.VERIFIED_OPPORTUNITY]: {
    owner: "AIOP",
    storageHint: "RATE/AIOP/records/verified-opportunities",
    nextAllowedModule: "FundTrackerAI"
  },
  [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE]: {
    owner: "FundTrackerAI",
    storageHint: "RATE/FundTrackerAI/records/activated-transaction-states",
    nextAllowedModule: "ReceivingEnvironment"
  },
  [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD]: {
    owner: "ReceivingEnvironment",
    storageHint: "receiving-environments/records/live-system-records",
    nextAllowedModule: "PAID"
  }
};

export function resolvePlacement(artifactType) {
  if (!isKnownArtifactType(artifactType)) {
    return { allowed: false, reason: "UNKNOWN_ARTIFACT_TYPE", artifactType };
  }

  return { allowed: true, artifactType, ...ARTIFACT_PLACEMENT[artifactType] };
}

export function canModuleEmit(moduleName, artifactType) {
  const authority = MODULE_AUTHORITY[moduleName];

  if (!authority) {
    return { allowed: false, reason: "UNKNOWN_MODULE_AUTHORITY", moduleName, artifactType };
  }

  if (authority.mustNotEmit?.includes(artifactType)) {
    return { allowed: false, reason: "MODULE_EXPLICITLY_FORBIDDEN_TO_EMIT_ARTIFACT", moduleName, artifactType };
  }

  if (!authority.mayEmit?.includes(artifactType)) {
    return { allowed: false, reason: "MODULE_NOT_AUTHORIZED_TO_EMIT_ARTIFACT", moduleName, artifactType };
  }

  return { allowed: true, moduleName, artifactType };
}
