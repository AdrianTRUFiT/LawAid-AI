export type CognitiveLoadClass =
  | "low"
  | "guarded"
  | "elevated"
  | "high";

export type DepletionRiskClass =
  | "low"
  | "guarded"
  | "elevated"
  | "high";

export type StabilityBalanceClass =
  | "stable"
  | "strained"
  | "imbalanced"
  | "depleted";

export interface EnergyEconomicsInput {
  subjectId: string;
  timeMinutes: number;
  waitingMinutes: number;
  handoffCount: number;
  ambiguityScore: number;
  reworkCount: number;
  decisionCount: number;
}

export interface TimeEnergyTranslation {
  timeCostScore: number;
  energyCostScore: number;
  savedEnergyScore: number;
}

export interface CognitiveLoadProfile {
  cognitiveLoadClass: CognitiveLoadClass;
  cognitiveLoadScore: number;
}

export interface DepletionProfile {
  depletionRiskClass: DepletionRiskClass;
  depletionRiskScore: number;
}

export interface StabilityProfile {
  stabilityBalanceClass: StabilityBalanceClass;
  balanceScore: number;
}

export interface EnergyEconomicsArtifact {
  subjectId: string;
  translation: TimeEnergyTranslation;
  cognitiveLoad: CognitiveLoadProfile;
  depletion: DepletionProfile;
  stability: StabilityProfile;
  createdAt: string;
}

export interface EnergyEconomicsRefusal {
  refusalCode:
    | "INVALID_TIME"
    | "INVALID_WAIT"
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface EnergyEconomicsResult {
  ok: boolean;
  artifact: EnergyEconomicsArtifact | null;
  refusal: EnergyEconomicsRefusal | null;
}