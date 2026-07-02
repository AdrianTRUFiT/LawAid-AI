import type { EnablerDemandArtifact } from "../../absorbed-role-to-enabler-demand-bridge/src/index.js";

export type LogisticalViabilityStatus =
  | "CHAIN_SOUND_OPPORTUNITY"
  | "HELD_ECONOMICALLY"
  | "HELD_DOWNSTREAM"
  | "REFUSED_UPSTREAM";

export interface LogisticalViabilityInput {
  subjectId: string;
  enablerDemand: EnablerDemandArtifact | null;
  upstreamDependencyScore: number;
  economicViabilityScore: number;
  downstreamConsequenceScore: number;
  engagementDurabilityScore: number;
}

export interface LogisticalViabilityArtifact {
  logisticalViabilityId: string;
  subjectId: string;
  logisticalViabilityStatus: LogisticalViabilityStatus;
  viabilityCompositeScore: number;
  advanceRecommendation: "advance" | "hold" | "refuse";
  reason: string;
  createdAt: string;
}

export interface LogisticalViabilityRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface LogisticalViabilityResult {
  ok: boolean;
  artifact: LogisticalViabilityArtifact | null;
  refusal: LogisticalViabilityRefusal | null;
}