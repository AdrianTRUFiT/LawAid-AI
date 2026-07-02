import {
  FundTrackerTruthSeal,
  MotionIntelligencePlan,
  MovingIntelligenceContainer,
  RVRReceipt,
  TISConsequenceEvaluation,
  TrustedTransactionRecord,
  TrustedTransactionRequest,
  TrustedTransactionScenario,
  WorkflowCourierTransportRecord
} from "./trustedTransactionContracts";

const request: TrustedTransactionRequest = {
  requestId: "req_001",
  requestedBy: "consumer_001",
  merchantReference: "merchant_001",
  consumerReference: "consumer_001",
  requestedAction: "purchase",
  requestedAmount: 49,
  currency: "USD",
  timestamp: "2026-04-30T11:00:00.000Z",
  status: "REQUESTED"
};

const mic: MovingIntelligenceContainer = {
  micId: "mic_001",
  requestId: "req_001",
  sender: "consumer_001",
  receiver: "merchant_001",
  expectedSender: "consumer_001",
  expectedReceiver: "merchant_001",
  routeExpiresAt: "2026-05-01T00:00:00.000Z",
  integrityHash: "hash_valid",
  expectedIntegrityHash: "hash_valid",
  status: "DELIVERED"
};

const miPlan: MotionIntelligencePlan = {
  miPlanId: "mi_001",
  micId: "mic_001",
  checkpointSequence: ["cp_001", "cp_002", "cp_003"],
  allowedTransitions: ["CREATED->IN_TRANSPORT", "IN_TRANSPORT->DELIVERED"],
  status: "COMPLETE"
};

const transport: WorkflowCourierTransportRecord = {
  transportId: "wfc_001",
  micId: "mic_001",
  miPlanId: "mi_001",
  checkpointEvents: [
    { checkpointId: "cp_001", status: "PASSED", timestamp: "2026-04-30T11:01:00.000Z" },
    { checkpointId: "cp_002", status: "PASSED", timestamp: "2026-04-30T11:02:00.000Z" },
    { checkpointId: "cp_003", status: "PASSED", timestamp: "2026-04-30T11:03:00.000Z" }
  ],
  finalTransportStatus: "COMPLETE"
};

const tis: TISConsequenceEvaluation = {
  tisEvaluationId: "tis_001",
  micId: "mic_001",
  transportId: "wfc_001",
  decision: "APPROVED",
  decisionReason: "All required readiness artifacts present.",
  releaseConditions: [],
  timestamp: "2026-04-30T11:04:00.000Z"
};

const fundSeal: FundTrackerTruthSeal = {
  truthSealId: "fts_001",
  micId: "mic_001",
  financialTruthState: "SEALED",
  activatedTransactionStateId: "ats_001",
  sealTimestamp: "2026-04-30T11:05:00.000Z"
};

const trustedRecord: TrustedTransactionRecord = {
  trustedTransactionId: "tt_001",
  requestId: "req_001",
  micId: "mic_001",
  tisEvaluationId: "tis_001",
  fundTrackerTruthSealId: "fts_001",
  finalState: "RECORDED",
  createdAt: "2026-04-30T11:06:00.000Z",
  completedAt: "2026-04-30T11:07:00.000Z",
  soulMarkId: "soulmark_001",
  soulRegistryReference: "soulregistry_001"
};

const rvr: RVRReceipt = {
  rvrReceiptId: "rvr_001",
  trustedTransactionId: "tt_001",
  soulMarkId: "soulmark_001",
  soulRegistryReference: "soulregistry_001",
  receiptStatus: "RVR_COMPLETE",
  issuedAt: "2026-04-30T11:08:00.000Z"
};

export const happyPathScenario: TrustedTransactionScenario = {
  name: "happy_path",
  request,
  mic,
  miPlan,
  transport,
  tis,
  fundSeal,
  trustedRecord,
  rvr,
  processorSuccess: true,
  soulMarkRequested: true,
  soulRegistryRequested: true,
  fintechionaiRequested: true,
  beeatsRequested: true
};

export const negativeScenarios: TrustedTransactionScenario[] = [
  { ...happyPathScenario, name: "missing_mic", mic: undefined },
  {
    ...happyPathScenario,
    name: "mic_hash_failed",
    mic: { ...mic, integrityHash: "tampered" }
  },
  {
    ...happyPathScenario,
    name: "mic_party_binding_mismatch",
    mic: { ...mic, receiver: "wrong_merchant" }
  },
  {
    ...happyPathScenario,
    name: "mic_route_expired",
    mic: { ...mic, routeExpiresAt: "2026-04-29T00:00:00.000Z" }
  },
  { ...happyPathScenario, name: "mi_plan_missing", miPlan: undefined },
  {
    ...happyPathScenario,
    name: "wfc_invalid_checkpoint_chain",
    transport: {
      ...transport,
      checkpointEvents: [
        { checkpointId: "cp_001", status: "PASSED", timestamp: "2026-04-30T11:01:00.000Z" },
        { checkpointId: "cp_002", status: "HELD", timestamp: "2026-04-30T11:02:00.000Z" }
      ],
      finalTransportStatus: "COMPLETE"
    }
  },
  { ...happyPathScenario, name: "tis_evaluation_missing", tis: undefined },
  {
    ...happyPathScenario,
    name: "tis_approved_without_fundtracker_seal",
    fundSeal: { ...fundSeal, financialTruthState: "UNSEALED", activatedTransactionStateId: undefined }
  },
  {
    ...happyPathScenario,
    name: "processor_success_without_verified_state",
    processorSuccess: true,
    fundSeal: undefined
  },
  {
    ...happyPathScenario,
    name: "replay_authorization",
    replayAttempt: true
  },
  {
    ...happyPathScenario,
    name: "rvr_before_record",
    trustedRecord: undefined
  },
  {
    ...happyPathScenario,
    name: "soulmark_before_truth",
    soulMarkRequested: true,
    fundSeal: { ...fundSeal, financialTruthState: "UNSEALED", activatedTransactionStateId: undefined }
  },
  {
    ...happyPathScenario,
    name: "soulregistry_before_truth_seal",
    soulRegistryRequested: true,
    fundSeal: { ...fundSeal, financialTruthState: "UNSEALED", activatedTransactionStateId: undefined }
  },
  {
    ...happyPathScenario,
    name: "fintechionai_before_trusted_record",
    fintechionaiRequested: true,
    trustedRecord: undefined
  },
  {
    ...happyPathScenario,
    name: "beeats_before_final_state",
    beeatsRequested: true,
    trustedRecord: { ...trustedRecord, finalState: "FINANCIAL_TRUTH_SEALED" }
  }
];
