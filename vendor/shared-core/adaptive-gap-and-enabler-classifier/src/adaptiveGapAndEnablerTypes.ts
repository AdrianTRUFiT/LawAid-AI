import type { EcosystemReadinessArtifact } from "../../ecosystem-readiness-intelligence-layer/src/index.js";

export type OwnershipLayer =
  | "sensor"
  | "machine"
  | "hybrid"
  | "human";

export type MissingEnablerClass =
  | "sensor_package"
  | "automation_workflow"
  | "anomaly_resolution"
  | "governance_override"
  | "balanced";

export interface AdaptiveGapAndEnablerInput {
  subjectId: string;
  ecosystemReadiness: EcosystemReadinessArtifact | null;
}

export interface AdaptiveGapAndEnablerArtifact {
  adaptiveGapId: string;
  subjectId: string;
  ownershipLayer: OwnershipLayer;
  missingEnablerClass: MissingEnablerClass;
  weakestLayer: string;
  conversionPriority: "high" | "medium" | "low";
  reason: string;
  createdAt: string;
}

export interface AdaptiveGapAndEnablerRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface AdaptiveGapAndEnablerResult {
  ok: boolean;
  artifact: AdaptiveGapAndEnablerArtifact | null;
  refusal: AdaptiveGapAndEnablerRefusal | null;
}