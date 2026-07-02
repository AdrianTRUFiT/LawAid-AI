import type { ReviewedShellActivationReadinessArtifact } from "../../reviewed-shell-activation-readiness-bridge/src/index.js";

export type ActivationEnvelopeStatus =
  | "ACTIVATION_ENVELOPE_READY"
  | "ACTIVATION_ENVELOPE_HELD"
  | "ACTIVATION_ENVELOPE_REFUSED";

export interface ActivationEnvelopeFormationInput {
  subjectId: string;
  activationReadiness: ReviewedShellActivationReadinessArtifact | null;
}

export interface ActivationEnvelopeFormationArtifact {
  activationEnvelopeId: string;
  subjectId: string;
  activationEnvelopeStatus: ActivationEnvelopeStatus;
  activationReadinessId: string;
  artifactType: "ActivationEnvelope";
  liveRecordCreationEligible: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface ActivationEnvelopeFormationRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ActivationEnvelopeFormationResult {
  ok: boolean;
  artifact: ActivationEnvelopeFormationArtifact | null;
  refusal: ActivationEnvelopeFormationRefusal | null;
}