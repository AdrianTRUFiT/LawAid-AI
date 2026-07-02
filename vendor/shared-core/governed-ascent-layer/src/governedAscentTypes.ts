export type PressureClass =
  | "time"
  | "money"
  | "consumption"
  | "logistics"
  | "layers";

export type AscentStage =
  | "GROUND_ZERO"
  | "LAYER_1"
  | "LAYER_2"
  | "LAYER_3"
  | "LAYER_4"
  | "LAYER_5"
  | "LAYER_6"
  | "SUMMIT";

export type AscentDecision =
  | "ASCEND"
  | "HOLD"
  | "REFUSE";

export interface AscentInput {
  subjectId: string;
  currentStage: AscentStage;
  targetStage: AscentStage;
  pressureProfile: Record<PressureClass, number>;
  movementMaturityClass?: "early" | "developing" | "late" | "exhaustion_risk";
  hazardClass?: "low" | "guarded" | "elevated" | "high";
  pressureClass?: "low" | "guarded" | "elevated" | "high";
  lawfulProgressionRequired?: boolean;
}

export interface NarrowingProfile {
  currentStageWeight: number;
  targetStageWeight: number;
  narrowingDelta: number;
}

export interface AscentArtifact {
  subjectId: string;
  currentStage: AscentStage;
  targetStage: AscentStage;
  decision: AscentDecision;
  totalPressureScore: number;
  dominantPressure: PressureClass;
  narrowingProfile: NarrowingProfile;
  lawfulProgression: boolean;
  reason: string;
  createdAt: string;
}

export interface GovernedAscentRefusal {
  refusalCode:
    | "INVALID_STAGE"
    | "ILLEGAL_STAGE_JUMP"
    | "PRESSURE_OVERLOAD"
    | "HIGH_HAZARD_BLOCK";
  refusalReason: string;
}

export interface GovernedAscentResult {
  ok: boolean;
  artifact: AscentArtifact | null;
  refusal: GovernedAscentRefusal | null;
}