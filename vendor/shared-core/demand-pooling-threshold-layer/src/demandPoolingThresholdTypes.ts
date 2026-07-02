import type { ProblemLedInquiryArtifact } from "../../problem-led-inquiry-intelligence-layer/src/index.js";

export type PoolingStatus =
  | "ISOLATED"
  | "POOLING_PENDING"
  | "POOLING_READY";

export interface DemandPoolingThresholdInput {
  subjectId: string;
  inquiryIntelligence: ProblemLedInquiryArtifact | null;
  currentDemandCount: number;
  requiredThreshold: number;
}

export interface DemandPoolingThresholdArtifact {
  poolingThresholdId: string;
  subjectId: string;
  poolingStatus: PoolingStatus;
  currentDemandCount: number;
  requiredThreshold: number;
  thresholdGap: number;
  releaseReady: boolean;
  poolingRecommended: boolean;
  reason: string;
  createdAt: string;
}

export interface DemandPoolingThresholdRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "INVALID_THRESHOLD"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface DemandPoolingThresholdResult {
  ok: boolean;
  artifact: DemandPoolingThresholdArtifact | null;
  refusal: DemandPoolingThresholdRefusal | null;
}