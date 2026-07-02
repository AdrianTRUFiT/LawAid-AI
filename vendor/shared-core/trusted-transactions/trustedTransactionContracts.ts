export type TrustedTransactionDecision =
  | "APPROVED"
  | "HELD"
  | "REFUSED"
  | "REPLAY_ATTACK";

export type TrustedTransactionFinalState =
  | "REQUESTED"
  | "CONTAINER_CREATED"
  | "IN_TRANSPORT"
  | "CHECKPOINT_PASSED"
  | "APPROVED_FOR_TRUTH_REVIEW"
  | "FINANCIAL_TRUTH_SEALED"
  | "RVR_COMPLETE"
  | "RECORDED"
  | "REFUSED";

export type RefusalCode =
  | "MIC_MISSING"
  | "MIC_HASH_FAILED"
  | "MIC_PARTY_BINDING_MISMATCH"
  | "MIC_ROUTE_EXPIRED"
  | "MI_PLAN_MISSING"
  | "WFC_INVALID_CHECKPOINT_CHAIN"
  | "TIS_EVALUATION_MISSING"
  | "TIS_APPROVED_WITHOUT_FUNDTRACKER_SEAL"
  | "PROCESSOR_SUCCESS_WITHOUT_VERIFIED_STATE"
  | "REPLAY_AUTHORIZATION"
  | "RVR_BEFORE_RECORD"
  | "SOULMARK_BEFORE_TRUTH"
  | "SOULREGISTRY_BEFORE_TRUTH_SEAL"
  | "FINTECHIONAI_BEFORE_TRUSTED_RECORD"
  | "BEEATS_BEFORE_FINAL_STATE";

export interface TrustedTransactionRequest {
  requestId: string;
  requestedBy: string;
  merchantReference: string;
  consumerReference: string;
  requestedAction: string;
  requestedAmount?: number;
  currency?: string;
  timestamp: string;
  status: "REQUESTED";
}

export interface MovingIntelligenceContainer {
  micId: string;
  requestId: string;
  sender: string;
  receiver: string;
  expectedSender: string;
  expectedReceiver: string;
  routeExpiresAt: string;
  integrityHash: string;
  expectedIntegrityHash: string;
  status: "CONTAINER_CREATED" | "IN_TRANSPORT" | "DELIVERED";
}

export interface MotionIntelligencePlan {
  miPlanId: string;
  micId: string;
  checkpointSequence: string[];
  allowedTransitions: string[];
  status: "ACTIVE" | "EXPIRED" | "COMPLETE";
}

export interface WorkflowCourierTransportRecord {
  transportId: string;
  micId: string;
  miPlanId: string;
  checkpointEvents: Array<{
    checkpointId: string;
    status: "PASSED" | "HELD" | "REFUSED";
    timestamp: string;
  }>;
  finalTransportStatus: "IN_TRANSPORT" | "COMPLETE" | "REFUSED";
}

export interface TISConsequenceEvaluation {
  tisEvaluationId: string;
  micId: string;
  transportId: string;
  decision: TrustedTransactionDecision;
  decisionReason: string;
  releaseConditions: string[];
  timestamp: string;
}

export interface FundTrackerTruthSeal {
  truthSealId: string;
  micId: string;
  financialTruthState: "SEALED" | "UNSEALED" | "REFUSED";
  activatedTransactionStateId?: string;
  sealTimestamp?: string;
}

export interface RVRReceipt {
  rvrReceiptId: string;
  trustedTransactionId: string;
  soulMarkId?: string;
  soulRegistryReference?: string;
  receiptStatus: "RVR_COMPLETE" | "BLOCKED";
  issuedAt: string;
}

export interface TrustedTransactionRecord {
  trustedTransactionId: string;
  requestId: string;
  micId: string;
  tisEvaluationId: string;
  fundTrackerTruthSealId: string;
  rvrReceiptId?: string;
  soulMarkId?: string;
  soulRegistryReference?: string;
  finalState: TrustedTransactionFinalState;
  createdAt: string;
  completedAt?: string;
}

export interface TrustedTransactionScenario {
  name: string;
  request?: TrustedTransactionRequest;
  mic?: MovingIntelligenceContainer;
  miPlan?: MotionIntelligencePlan;
  transport?: WorkflowCourierTransportRecord;
  tis?: TISConsequenceEvaluation;
  fundSeal?: FundTrackerTruthSeal;
  rvr?: RVRReceipt;
  trustedRecord?: TrustedTransactionRecord;
  processorSuccess?: boolean;
  replayAttempt?: boolean;
  soulMarkRequested?: boolean;
  soulRegistryRequested?: boolean;
  fintechionaiRequested?: boolean;
  beeatsRequested?: boolean;
}

export interface HILResult {
  scenario: string;
  allowed: boolean;
  refusalCodes: RefusalCode[];
  blockedConsequence: boolean;
  rvrAllowed: boolean;
  trustedRecordExists: boolean;
}
