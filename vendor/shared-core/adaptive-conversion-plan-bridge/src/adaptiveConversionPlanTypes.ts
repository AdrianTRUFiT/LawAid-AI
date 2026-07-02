import type { EcosystemReadinessArtifact } from "../../ecosystem-readiness-intelligence-layer/src/index.js";
import type { AdaptiveGapAndEnablerArtifact } from "../../adaptive-gap-and-enabler-classifier/src/index.js";

export type AdaptiveConversionPlanStatus =
  | "CONVERSION_PLAN_HIGH_PRIORITY"
  | "CONVERSION_PLAN_MEDIUM_PRIORITY"
  | "CONVERSION_PLAN_LOW_PRIORITY";

export interface AdaptiveConversionPlanInput {
  subjectId: string;
  ecosystemReadiness: EcosystemReadinessArtifact | null;
  adaptiveGap: AdaptiveGapAndEnablerArtifact | null;
}

export interface AdaptiveConversionPlanArtifact {
  adaptiveConversionPlanId: string;
  subjectId: string;
  adaptiveConversionPlanStatus: AdaptiveConversionPlanStatus;
  settlementType: "town" | "city" | "community";
  primaryConversionTrack:
    | "sensor_instrumentation"
    | "machine_automation"
    | "hybrid_exception_layer"
    | "human_governance_layer";
  firstMove: string;
  reason: string;
  createdAt: string;
}

export interface AdaptiveConversionPlanRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface AdaptiveConversionPlanResult {
  ok: boolean;
  artifact: AdaptiveConversionPlanArtifact | null;
  refusal: AdaptiveConversionPlanRefusal | null;
}