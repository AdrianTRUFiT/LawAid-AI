import type { MovingIntelligenceContainer } from "./micContracts";
import type { MotionIntelligencePlan } from "./motionIntelligenceContracts";
import type { TisConsequenceEvaluation } from "./tisConsequenceContracts";
import type { TrustedTransactionRequest } from "./trustedTransactionContracts";
import type { FundTrackerTruthSeal, SoulMarkProofStamp, SoulRegistryRecordPointer } from "./trustedTransactionArtifacts";
import type { WorkflowCourierTransportRecord } from "./workflowCourierContracts";

export type HilRefusalCode =
  | "MISSING_REQUEST"
  | "MISSING_MIC"
  | "MISSING_MI_PLAN"
  | "MISSING_WFC_TRANSPORT_RECORD"
  | "MISSING_TIS_EVALUATION"
  | "MISSING_FUNDTRACKER_TRUTH_SEAL"
  | "MISSING_SOULMARK_STAMP"
  | "MISSING_SOULREGISTRY_RECORD"
  | "EXPIRED_ROUTE"
  | "WRONG_PARTY"
  | "REPLAY_ATTEMPT"
  | "DUPLICATE_CONTAINER_USE"
  | "PROCESSOR_SUCCESS_WITHOUT_VERIFIED_STATE"
  | "RAIL_SUCCESS_WITHOUT_TRUTH"
  | "TRANSPORT_COMPLETE_WITHOUT_TRUTH_SEAL"
  | "RECEIPT_ATTEMPT_BEFORE_RECORD"
  | "UNAUTHORIZED_CONSEQUENCE"
  | "MISMATCHED_PROOF_RECORD"
  | "UNSUPPORTED_ARTIFACT_CHAIN"
  | "TIS_APPROVED_BUT_FUNDTRACKER_NOT_SEALED";

export type HilRefusal = {
  code: HilRefusalCode;
  message: string;
};

export type HilEvaluationInput = {
  nowIso: string;
  request?: TrustedTransactionRequest;
  mic?: MovingIntelligenceContainer;
  miPlan?: MotionIntelligencePlan;
  transport?: WorkflowCourierTransportRecord;
  tis?: TisConsequenceEvaluation;
  fundTrackerSeal?: FundTrackerTruthSeal;
  soulMark?: SoulMarkProofStamp;
  soulRegistry?: SoulRegistryRecordPointer;
  attemptedReceipt?: boolean;
  attemptedConsequence?: boolean;
  processorSucceeded?: boolean;
  railSucceeded?: boolean;
  replayAttempt?: boolean;
  duplicateContainerUse?: boolean;
  wrongParty?: boolean;
};

export function evaluateHilRefusals(input: HilEvaluationInput): HilRefusal[] {
  const refusals: HilRefusal[] = [];

  if (!input.request) refusals.push({ code: "MISSING_REQUEST", message: "Trusted transaction request is missing." });
  if (!input.mic) refusals.push({ code: "MISSING_MIC", message: "MIC is missing." });
  if (!input.miPlan) refusals.push({ code: "MISSING_MI_PLAN", message: "MI plan is missing." });
  if (!input.transport) refusals.push({ code: "MISSING_WFC_TRANSPORT_RECORD", message: "WFC transport record is missing." });
  if (!input.tis) refusals.push({ code: "MISSING_TIS_EVALUATION", message: "TIS evaluation is missing." });
  if (!input.fundTrackerSeal) refusals.push({ code: "MISSING_FUNDTRACKER_TRUTH_SEAL", message: "FundTrackerAI truth seal is missing." });
  if (!input.soulMark) refusals.push({ code: "MISSING_SOULMARK_STAMP", message: "SoulMark proof stamp is missing." });
  if (!input.soulRegistry) refusals.push({ code: "MISSING_SOULREGISTRY_RECORD", message: "SoulRegistry record is missing." });

  if (input.miPlan && Date.parse(input.miPlan.expiresAt) <= Date.parse(input.nowIso)) {
    refusals.push({ code: "EXPIRED_ROUTE", message: "MI plan route expired." });
  }

  if (input.wrongParty) refusals.push({ code: "WRONG_PARTY", message: "Wrong party attempted to create consequence." });
  if (input.replayAttempt) refusals.push({ code: "REPLAY_ATTEMPT", message: "Replay attempt blocked." });
  if (input.duplicateContainerUse) refusals.push({ code: "DUPLICATE_CONTAINER_USE", message: "Duplicate MIC use blocked." });

  if (input.processorSucceeded && !input.fundTrackerSeal) {
    refusals.push({ code: "PROCESSOR_SUCCESS_WITHOUT_VERIFIED_STATE", message: "Processor success is not verified state." });
  }

  if (input.railSucceeded && !input.fundTrackerSeal) {
    refusals.push({ code: "RAIL_SUCCESS_WITHOUT_TRUTH", message: "Rail success does not become truth." });
  }

  if (input.transport?.finalTransportStatus === "COMPLETED" && !input.fundTrackerSeal) {
    refusals.push({ code: "TRANSPORT_COMPLETE_WITHOUT_TRUTH_SEAL", message: "Transport complete without truth seal." });
  }

  if (input.attemptedReceipt && (!input.soulMark || !input.soulRegistry || !input.fundTrackerSeal)) {
    refusals.push({ code: "RECEIPT_ATTEMPT_BEFORE_RECORD", message: "RVR receipt attempted before verification and record preservation." });
  }

  if (input.attemptedConsequence && !input.fundTrackerSeal) {
    refusals.push({ code: "UNAUTHORIZED_CONSEQUENCE", message: "Consequence attempted without FundTrackerAI truth seal." });
  }

  if (input.tis?.decision === "APPROVED" && !input.fundTrackerSeal) {
    refusals.push({ code: "TIS_APPROVED_BUT_FUNDTRACKER_NOT_SEALED", message: "TIS approval does not equal FundTrackerAI financial truth seal." });
  }

  if (input.soulMark && input.soulRegistry && input.soulMark.trustedTransactionId !== input.soulRegistry.trustedTransactionId) {
    refusals.push({ code: "MISMATCHED_PROOF_RECORD", message: "SoulMark and SoulRegistry references do not match." });
  }

  return refusals;
}

export function hasRefusal(refusals: HilRefusal[], code: HilRefusalCode): boolean {
  return refusals.some((refusal) => refusal.code === code);
}
