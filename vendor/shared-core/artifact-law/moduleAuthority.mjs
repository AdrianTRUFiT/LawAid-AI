import { ARTIFACT_TYPES } from "./artifactTypes.mjs";

export const MODULE_AUTHORITY = {
  DICE: {
    stage: "Recruit",
    mayEmit: [ARTIFACT_TYPES.CAPTURED_SIGNAL],
    mustNotEmit: [
      ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  },

  AIOP: {
    stage: "Acquire",
    mayEmit: [ARTIFACT_TYPES.VERIFIED_OPPORTUNITY],
    mustNotEmit: [
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  },

  FundTrackerAI: {
    stage: "Transact",
    mayEmit: [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE],
    mustNotEmit: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD]
  },

  ReceivingEnvironment: {
    stage: "Engage",
    mayEmit: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD],
    mustNotEmit: []
  }
};
