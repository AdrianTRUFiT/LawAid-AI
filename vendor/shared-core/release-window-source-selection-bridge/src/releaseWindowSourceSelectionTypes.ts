import type { BookingReadyFormationArtifact } from "../../booking-ready-formation-bridge/src/index.js";

export type SourceSelectionStatus =
  | "SOURCE_SELECTED"
  | "SOURCE_HELD"
  | "SOURCE_REFUSED";

export type ReleaseWindowClass =
  | "immediate"
  | "scheduled"
  | "delayed";

export interface SourceOption {
  sourceId: string;
  label: string;
  sourceType: "pooled" | "isolated";
  available: boolean;
  qualityScore: number;
  marginScore: number;
  releaseDelayHours: number;
}

export interface ReleaseWindowSourceSelectionInput {
  subjectId: string;
  bookingReady: BookingReadyFormationArtifact | null;
  sourceOptions: SourceOption[];
  releaseUrgencyScore: number;
}

export interface ReleaseWindowSourceSelectionArtifact {
  sourceSelectionId: string;
  subjectId: string;
  sourceSelectionStatus: SourceSelectionStatus;
  selectedSourceId: string | null;
  selectedSourceType: "pooled" | "isolated" | "none";
  releaseWindowClass: ReleaseWindowClass;
  releaseEligible: boolean;
  sourceCompositeScore: number;
  reason: string;
  createdAt: string;
}

export interface ReleaseWindowSourceSelectionRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "NO_ELIGIBLE_SOURCE";
  refusalReason: string;
}

export interface ReleaseWindowSourceSelectionResult {
  ok: boolean;
  artifact: ReleaseWindowSourceSelectionArtifact | null;
  refusal: ReleaseWindowSourceSelectionRefusal | null;
}