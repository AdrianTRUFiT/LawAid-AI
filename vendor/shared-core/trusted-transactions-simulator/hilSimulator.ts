import {
  evaluateHilRefusals,
  type FundTrackerTruthSeal,
  type HilEvaluationInput,
  type HilRefusal,
  type MovingIntelligenceContainer,
  type MotionIntelligencePlan,
  type RvrReceipt,
  type SoulMarkProofStamp,
  type SoulRegistryRecordPointer,
  type TisConsequenceEvaluation,
  type TrustedTransactionRecord,
  type TrustedTransactionRequest,
  type WorkflowCourierTransportRecord,
} from "../trusted-transactions";

export type TrustedTransactionSimulationResult = {
  name: string;
  states: string[];
  refusals: HilRefusal[];
  rvrReceipt?: RvrReceipt;
  trustedTransactionRecord?: TrustedTransactionRecord;
  hilPassed: boolean;
  proofLine: string;
};

export function createValidSimulationInput(nowIso: string): Required<
  Pick<
    HilEvaluationInput,
    "request" | "mic" | "miPlan" | "transport" | "tis" | "fundTrackerSeal" | "soulMark" | "soulRegistry"
  >
> & Pick<HilEvaluationInput, "nowIso" | "attemptedReceipt" | "attemptedConsequence" | "processorSucceeded" | "railSucceeded"> {
  const request: TrustedTransactionRequest = {
    requestId: "tt-req-001",
    requestSource: "PAI_SAFE",
    requestedBy: "consumer-001",
    merchantReference: "merchant-001",
    consumerReference: "consumer-001",
    intentReference: "intent-001",
    requestedAction: "PAYMENT",
    requestedAmount: 25,
    currency: "USD",
    purpose: "simulated protected transaction",
    timestamp: nowIso,
    paiSafeVisible: true,
    rawRailSignals: [],
    status: "REQUESTED",
  };

  const mic: MovingIntelligenceContainer = {
    micId: "mic-001",
    trustedTransactionRequestId: request.requestId,
    containerType: "PAYMENT_REFERENCE",
    containedReferences: ["payment-reference-001"],
    authorityClaims: ["consumer intent present", "merchant reference present"],
    proofReferences: ["proof-reference-001"],
    routePlanId: "mi-plan-001",
    currentCheckpoint: "checkpoint-final",
    motionState: "APPROVED_FOR_TRUTH_REVIEW",
    createdAt: nowIso,
    updatedAt: nowIso,
    integrityHash: "hash-mic-001",
    carriesAssetCustody: false,
    carriesVerifiedAuthorityReference: true,
  };

  const miPlan: MotionIntelligencePlan = {
    miPlanId: "mi-plan-001",
    micId: mic.micId,
    routeType: "SIMULATED",
    checkpointSequence: ["checkpoint-origin", "checkpoint-proof", "checkpoint-final"],
    allowedTransitions: ["CREATE_CONTAINER", "PLAN_ROUTE", "ENTER_TRANSPORT", "PASS_CHECKPOINT", "APPROVE_FOR_TRUTH_REVIEW"],
    holdRules: ["missing proof"],
    releaseRules: ["all checkpoints verified"],
    rerouteRules: [],
    exceptionRules: ["replay blocks route"],
    syncRules: ["transport follows MI plan"],
    expiresAt: new Date(Date.parse(nowIso) + 1000 * 60 * 60).toISOString(),
    status: "ROUTE_PLANNED",
    sealsTruth: false,
  };

  const transport: WorkflowCourierTransportRecord = {
    transportId: "wfc-transport-001",
    micId: mic.micId,
    miPlanId: miPlan.miPlanId,
    checkpointEvents: [
      { checkpointId: "checkpoint-origin", state: "CHECKPOINT_PASSED", timestamp: nowIso, proofReference: "proof-origin", note: "origin passed" },
      { checkpointId: "checkpoint-proof", state: "CHECKPOINT_PASSED", timestamp: nowIso, proofReference: "proof-mid", note: "proof passed" },
      { checkpointId: "checkpoint-final", state: "APPROVED_FOR_TRUTH_REVIEW", timestamp: nowIso, proofReference: "proof-final", note: "ready for truth review" },
    ],
    currentLocation: "checkpoint-final",
    currentState: "APPROVED_FOR_TRUTH_REVIEW",
    lastVerifiedCheckpoint: "checkpoint-final",
    transportProofs: ["proof-origin", "proof-mid", "proof-final"],
    exceptionEvents: [],
    finalTransportStatus: "COMPLETED",
    createsTruth: false,
  };

  const tis: TisConsequenceEvaluation = {
    tisEvaluationId: "tis-eval-001",
    micId: mic.micId,
    transportId: transport.transportId,
    evaluatedState: "APPROVED_FOR_TRUTH_REVIEW",
    decision: "APPROVED",
    decisionReason: "All simulated checkpoints present.",
    missingArtifacts: [],
    riskSignals: [],
    replaySignals: [],
    releaseConditions: ["FundTrackerAI truth seal required"],
    timestamp: nowIso,
    authorityBoundary: "CONSEQUENCE_READINESS_ONLY",
    sealsFinancialTruth: false,
  };

  const fundTrackerSeal: FundTrackerTruthSeal = {
    truthSealId: "fts-001",
    verifiedOpportunityId: "verified-opportunity-001",
    micId: mic.micId,
    processorEventReferences: ["processor-event-reference-001"],
    commitmentState: "VERIFIED",
    financialTruthState: "SEALED",
    entitlementState: "ELIGIBLE",
    activationEligibility: "ELIGIBLE_FOR_ACTIVATED_TRANSACTION_STATE",
    sealTimestamp: nowIso,
    proofReferences: ["proof-origin", "proof-mid", "proof-final"],
    activatedTransactionStateId: "activated-transaction-state-reference-001",
    sealedBy: "FundTrackerAI",
  };

  const soulMark: SoulMarkProofStamp = {
    soulMarkId: "soulmark-001",
    trustedTransactionId: "trusted-transaction-001",
    stampedAt: nowIso,
    proofHash: "proof-hash-001",
    createsFinancialTruth: false,
  };

  const soulRegistry: SoulRegistryRecordPointer = {
    soulRegistryReference: "soulregistry-001",
    trustedTransactionId: "trusted-transaction-001",
    recordedAt: nowIso,
    preserved: true,
    createsFinancialTruth: false,
  };

  return {
    nowIso,
    request,
    mic,
    miPlan,
    transport,
    tis,
    fundTrackerSeal,
    soulMark,
    soulRegistry,
    attemptedReceipt: true,
    attemptedConsequence: true,
    processorSucceeded: true,
    railSucceeded: true,
  };
}

export function runTrustedTransactionSimulation(
  name: string,
  input: HilEvaluationInput
): TrustedTransactionSimulationResult {
  const refusals = evaluateHilRefusals(input);

  const states = [
    "REQUESTED",
    input.mic ? "CONTAINER_CREATED" : "REFUSED",
    input.miPlan ? "ROUTE_PLANNED" : "REFUSED",
    input.transport ? "IN_TRANSPORT" : "REFUSED",
    input.transport?.checkpointEvents.length ? "CHECKPOINT_PASSED" : "HELD",
    input.tis?.decision === "REPLAY_ATTACK" ? "REPLAY_BLOCKED" : input.tis?.decision === "REFUSED" ? "REFUSED" : input.tis?.decision === "HELD" ? "HELD" : "APPROVED_FOR_TRUTH_REVIEW",
    input.fundTrackerSeal?.financialTruthState === "SEALED" ? "FINANCIAL_TRUTH_SEALED" : "REFUSED",
    input.soulMark ? "SOULMARK_STAMPED" : "REFUSED",
    input.soulRegistry?.preserved ? "SOULREGISTRY_RECORDED" : "REFUSED",
  ];

  const hilPassed = refusals.length === 0;

  if (!hilPassed) {
    return {
      name,
      states,
      refusals,
      hilPassed: false,
      proofLine: "HIL REFUSED — CONSEQUENCE BLOCKED UNTIL VERIFIED STATE EXISTS",
    };
  }

  const rvrReceipt: RvrReceipt = {
    rvrReceiptId: "rvr-001",
    trustedTransactionId: input.soulRegistry!.trustedTransactionId,
    requestSummary: "Request received through protected surface.",
    verificationSummary: "Consequence readiness evaluated and financial truth sealed by FundTrackerAI.",
    recordSummary: "SoulMark stamped and SoulRegistry preserved.",
    soulMarkId: input.soulMark!.soulMarkId,
    soulRegistryReference: input.soulRegistry!.soulRegistryReference,
    receiptStatus: "RVR_COMPLETE",
    issuedAt: input.nowIso,
    consumerSafeLanguage: "RVR Complete — Request Verified Recorded.",
    displayCreatesTruth: false,
  };

  const trustedTransactionRecord: TrustedTransactionRecord = {
    trustedTransactionId: input.soulRegistry!.trustedTransactionId,
    requestId: input.request!.requestId,
    micId: input.mic!.micId,
    tisEvaluationId: input.tis!.tisEvaluationId,
    fundTrackerTruthSealId: input.fundTrackerSeal!.truthSealId,
    rvrReceiptId: rvrReceipt.rvrReceiptId,
    soulMarkId: input.soulMark!.soulMarkId,
    soulRegistryReference: input.soulRegistry!.soulRegistryReference,
    finalState: "RECORDED",
    createdAt: input.nowIso,
    completedAt: input.nowIso,
    auditSummary: "Trusted Transaction completed through verified state, proof stamp, and preserved record.",
    createdFromRailSuccessOnly: false,
  };

  return {
    name,
    states: [...states, "RVR_COMPLETE"],
    refusals,
    rvrReceipt,
    trustedTransactionRecord,
    hilPassed: true,
    proofLine: "HIL PASSED — CONSEQUENCE ONLY AFTER VERIFIED STATE",
  };
}
