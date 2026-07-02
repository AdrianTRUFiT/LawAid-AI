import type { ActivatedTransactionStateEmissionArtifact } from "../../activated-transaction-state-emission-bridge/src/index.js";

export type ReceivingEnvironmentHandoffStatus =
  | "RECEIVING_ENVIRONMENT_HANDOFF_READY"
  | "RECEIVING_ENVIRONMENT_HANDOFF_HELD"
  | "RECEIVING_ENVIRONMENT_HANDOFF_REFUSED";

export interface ReceivingEnvironmentHandoffInput {
  subjectId: string;
  activatedTransactionStateEmission: ActivatedTransactionStateEmissionArtifact | null;
}

export interface ReceivingEnvironmentHandoffArtifact {
  receivingEnvironmentHandoffId: string;
  subjectId: string;
  receivingEnvironmentHandoffStatus: ReceivingEnvironmentHandoffStatus;
  emissionId: string;
  artifactTarget: "ReceivingEnvironment";
  liveSystemRecordEligible: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface ReceivingEnvironmentHandoffRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ReceivingEnvironmentHandoffResult {
  ok: boolean;
  artifact: ReceivingEnvironmentHandoffArtifact | null;
  refusal: ReceivingEnvironmentHandoffRefusal | null;
}