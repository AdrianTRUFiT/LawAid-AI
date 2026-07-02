import { ARTIFACT_TYPES, isKnownArtifactType } from "./artifactTypes.ts";
import { MODULE_AUTHORITY } from "./moduleAuthority.ts";

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

export const TRANSITIONS = [
  {
    from: ARTIFACT_TYPES.RAW_SIGNAL,
    to: ARTIFACT_TYPES.CAPTURED_SIGNAL,
    fromModule: "DICE",
    toModule: "DICE"
  },
  {
    from: ARTIFACT_TYPES.CAPTURED_SIGNAL,
    to: ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
    fromModule: "DICE",
    toModule: "AIOP"
  },
  {
    from: ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
    to: ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
    fromModule: "AIOP",
    toModule: "FundTrackerAI"
  },
  {
    from: ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
    to: ARTIFACT_TYPES.LIVE_SYSTEM_RECORD,
    fromModule: "FundTrackerAI",
    toModule: "ReceivingEnvironment"
  }
];

export function resolvePlacement(artifactType) {
  if (!isKnownArtifactType(artifactType)) {
    return {
      allowed: false,
      reason: "UNKNOWN_ARTIFACT_TYPE",
      artifactType
    };
  }

  return {
    allowed: true,
    artifactType,
    ...ARTIFACT_PLACEMENT[artifactType]
  };
}

export function canModuleEmit(moduleName, artifactType) {
  const authority = MODULE_AUTHORITY[moduleName];

  if (!authority) {
    return {
      allowed: false,
      reason: "UNKNOWN_MODULE_AUTHORITY",
      moduleName,
      artifactType
    };
  }

  if (authority.mustNotEmit?.includes(artifactType)) {
    return {
      allowed: false,
      reason: "MODULE_EXPLICITLY_FORBIDDEN_TO_EMIT_ARTIFACT",
      moduleName,
      artifactType
    };
  }

  if (!authority.mayEmit?.includes(artifactType)) {
    return {
      allowed: false,
      reason: "MODULE_NOT_AUTHORIZED_TO_EMIT_ARTIFACT",
      moduleName,
      artifactType
    };
  }

  return {
    allowed: true,
    moduleName,
    artifactType
  };
}

export function canTransition(fromArtifact, toArtifact, fromModule, toModule) {
  const match = TRANSITIONS.find(
    t =>
      t.from === fromArtifact &&
      t.to === toArtifact &&
      t.fromModule === fromModule &&
      t.toModule === toModule
  );

  if (!match) {
    return {
      allowed: false,
      reason: "TRANSITION_NOT_AUTHORIZED",
      fromArtifact,
      toArtifact,
      fromModule,
      toModule
    };
  }

  return {
    allowed: true,
    transition: match
  };
}

