export type MovementDirection =
  | "up"
  | "down"
  | "neutral"
  | "unknown";

export type MovementState =
  | "neutral_compression"
  | "early_ascent"
  | "mid_ascent"
  | "late_ascent"
  | "ascent_exhaustion_risk"
  | "early_descent"
  | "mid_descent"
  | "late_descent"
  | "descent_exhaustion_risk"
  | "reversal_watch"
  | "continuation_after_pause"
  | "unknown_state";

export type ViabilityClass =
  | "high"
  | "moderate"
  | "low"
  | "critical";

export type HazardClass =
  | "low"
  | "guarded"
  | "elevated"
  | "high";

export type MaturityClass =
  | "early"
  | "developing"
  | "late"
  | "exhaustion_risk";

export interface MovementMeterInput {
  subjectId: string;
  direction: string;
  stateLabel: string;
  magnitude: number;
  ageBars: number;
  p_nn?: number;
  anomalyScore?: number;
  timestamp: string;
  attributes?: Record<string, unknown>;
}

export interface StateAge {
  ageBars: number;
  expectedStaticTime: number | null;
}

export interface ViabilityEnvelope {
  viabilityClass: ViabilityClass;
  remainingRunwayBars: number;
  continuationImplausibility: number;
}

export interface TransitionHazard {
  hazardClass: HazardClass;
  hazardScore: number;
}

export interface ActionWindow {
  status: "open" | "narrowing" | "closing" | "closed";
  reason: string;
}

export interface MovementMeterArtifact {
  subjectId: string;
  movementState: MovementState;
  direction: MovementDirection;
  stateAge: StateAge;
  viabilityEnvelope: ViabilityEnvelope;
  transitionHazard: TransitionHazard;
  maturityClass: MaturityClass;
  actionWindow: ActionWindow;
  createdAt: string;
}

export interface MovementMeterRefusal {
  refusalCode:
    | "INVALID_AGE"
    | "INVALID_DIRECTION"
    | "INVALID_STATE_LABEL";
  refusalReason: string;
}

export interface MovementMeterResult {
  ok: boolean;
  artifact: MovementMeterArtifact | null;
  refusal: MovementMeterRefusal | null;
}