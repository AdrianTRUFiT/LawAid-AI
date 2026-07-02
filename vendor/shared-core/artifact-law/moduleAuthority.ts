import { ARTIFACT_TYPES } from "./artifactTypes.ts";

export const MODULE_AUTHORITY = {
  DICE: {
    stage: "Recruit",
    ownsCreationOf: [ARTIFACT_TYPES.CAPTURED_SIGNAL],
    receives: [ARTIFACT_TYPES.RAW_SIGNAL],
    mayEmit: [ARTIFACT_TYPES.CAPTURED_SIGNAL],
    mustNotEmit: [
      ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  },

  AIOP: {
    stage: "Acquire",
    ownsCreationOf: [ARTIFACT_TYPES.VERIFIED_OPPORTUNITY],
    receives: [ARTIFACT_TYPES.CAPTURED_SIGNAL],
    mayEmit: [ARTIFACT_TYPES.VERIFIED_OPPORTUNITY],
    mustNotEmit: [
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  },

  FundTrackerAI: {
    stage: "Transact",
    authority: "commitment_verification_and_financial_truth",
    ownsCreationOf: [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE],
    receives: [ARTIFACT_TYPES.VERIFIED_OPPORTUNITY],
    mayEmit: [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE],
    mustNotEmit: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD]
  },

  ReceivingEnvironment: {
    stage: "Engage",
    ownsCreationOf: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD],
    receives: [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE],
    mayEmit: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD],
    mustNotEmit: []
  },

  LawAidAI: {
    implementationOf: "ReceivingEnvironment",
    ownsCreationOf: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD],
    receives: [ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE],
    mayEmit: [ARTIFACT_TYPES.LIVE_SYSTEM_RECORD],
    mustNotEmit: []
  },

  TPS: {
    role: "merchant_facing_product_surface",
    ownsCreationOf: [],
    receives: [],
    mayEmit: [],
    mustNotEmit: [
      ARTIFACT_TYPES.CAPTURED_SIGNAL,
      ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  },

  BEEATS: {
    role: "market_activation_learning_layer",
    ownsCreationOf: [],
    receives: [],
    mayEmit: [],
    mustNotEmit: []
  },

  FinTechionAI: {
    role: "operator_side_financial_governance_inside_AIVA",
    ownsCreationOf: [],
    receives: [],
    mayEmit: [],
    mustNotEmit: [
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE
    ]
  },

  PAID: {
    role: "dashboard_control_surface_inside_iAscendAi",
    ownsCreationOf: [],
    receives: [],
    mayDisplay: [
      ARTIFACT_TYPES.CAPTURED_SIGNAL,
      ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ],
    mayEmit: [],
    mustNotEmit: [
      ARTIFACT_TYPES.CAPTURED_SIGNAL,
      ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
      ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
      ARTIFACT_TYPES.LIVE_SYSTEM_RECORD
    ]
  }
};

export function getModuleAuthority(moduleName) {
  return MODULE_AUTHORITY[moduleName] || null;
}

