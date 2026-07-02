import type { AscentArtifact } from "../../governed-ascent-layer/src/index.js";
import type { EnergyEconomicsArtifact } from "../../energy-economics-layer/src/index.js";

export type CompositeRecommendation =
  | "best"
  | "acceptable"
  | "costly"
  | "destabilizing";

export interface BizTechWellnessInput {
  subjectId: string;
  ascent: AscentArtifact;
  energy: EnergyEconomicsArtifact;
}

export interface BizTechWellnessArtifact {
  subjectId: string;
  businessScore: number;
  technologyScore: number;
  wellnessScore: number;
  compositeScore: number;
  recommendation: CompositeRecommendation;
  reasonSet: string[];
  createdAt: string;
}

export interface BizTechWellnessRefusal {
  refusalCode:
    | "SUBJECT_MISMATCH"
    | "MISSING_ASCENT"
    | "MISSING_ENERGY";
  refusalReason: string;
}

export interface BizTechWellnessResult {
  ok: boolean;
  artifact: BizTechWellnessArtifact | null;
  refusal: BizTechWellnessRefusal | null;
}