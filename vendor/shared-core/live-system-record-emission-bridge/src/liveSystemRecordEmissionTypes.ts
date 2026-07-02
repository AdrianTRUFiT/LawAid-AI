import type { ActivationEnvelopeFormationArtifact } from "../../activation-envelope-formation-bridge/src/index.js";

export type LiveSystemRecordEmissionStatus =
  | "LIVE_SYSTEM_RECORD_READY"
  | "LIVE_SYSTEM_RECORD_HELD"
  | "LIVE_SYSTEM_RECORD_REFUSED";

export interface LiveSystemRecordEmissionInput {
  subjectId: string;
  activationEnvelope: ActivationEnvelopeFormationArtifact | null;
}

export interface LiveSystemRecordEmissionArtifact {
  liveSystemRecordEmissionId: string;
  subjectId: string;
  liveSystemRecordEmissionStatus: LiveSystemRecordEmissionStatus;
  activationEnvelopeId: string;
  artifactType: "LiveSystemRecord";
  emissionReady: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface LiveSystemRecordEmissionRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface LiveSystemRecordEmissionResult {
  ok: boolean;
  artifact: LiveSystemRecordEmissionArtifact | null;
  refusal: LiveSystemRecordEmissionRefusal | null;
}