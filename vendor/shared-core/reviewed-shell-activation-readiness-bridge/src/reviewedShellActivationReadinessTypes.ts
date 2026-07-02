import type { ReceivingEnvironmentHandoffArtifact } from "../../receiving-environment-handoff-bridge/src/index.js";

export type ReviewedShellStatus =
  | "REVIEWED_SHELL_APPROVED"
  | "REVIEWED_SHELL_PENDING"
  | "REVIEWED_SHELL_REFUSED";

export interface ReviewedShellArtifact {
  reviewedShellId: string;
  subjectId: string;
  reviewedShellStatus: ReviewedShellStatus;
  shellApproved: boolean;
  reason: string;
  createdAt: string;
}

export type ActivationReadinessStatus =
  | "ACTIVATION_READY"
  | "ACTIVATION_HELD"
  | "ACTIVATION_REFUSED";

export interface ReviewedShellActivationReadinessInput {
  subjectId: string;
  receivingEnvironmentHandoff: ReceivingEnvironmentHandoffArtifact | null;
  reviewedShell: ReviewedShellArtifact | null;
}

export interface ReviewedShellActivationReadinessArtifact {
  activationReadinessId: string;
  subjectId: string;
  activationReadinessStatus: ActivationReadinessStatus;
  receivingEnvironmentHandoffId: string;
  reviewedShellId: string;
  activationEligible: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface ReviewedShellActivationReadinessRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ReviewedShellActivationReadinessResult {
  ok: boolean;
  artifact: ReviewedShellActivationReadinessArtifact | null;
  refusal: ReviewedShellActivationReadinessRefusal | null;
}