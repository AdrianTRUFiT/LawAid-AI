import type { ProblemLedInquiryArtifact } from "../../problem-led-inquiry-intelligence-layer/src/index.js";
import type { DemandPoolingThresholdArtifact } from "../../demand-pooling-threshold-layer/src/index.js";

export type QualityGateStatus =
  | "QUALITY_PASSED"
  | "QUALITY_HELD"
  | "QUALITY_REFUSED";

export interface QualityPreservationGateInput {
  subjectId: string;
  inquiryIntelligence: ProblemLedInquiryArtifact | null;
  poolingThreshold: DemandPoolingThresholdArtifact | null;
  qualityScore: number;
  providerReliabilityScore: number;
}

export interface QualityPreservationGateArtifact {
  qualityGateId: string;
  subjectId: string;
  qualityGateStatus: QualityGateStatus;
  qualityScore: number;
  providerReliabilityScore: number;
  qualityCompositeScore: number;
  poolingAware: boolean;
  releaseSafe: boolean;
  reason: string;
  createdAt: string;
}

export interface QualityPreservationGateRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface QualityPreservationGateResult {
  ok: boolean;
  artifact: QualityPreservationGateArtifact | null;
  refusal: QualityPreservationGateRefusal | null;
}