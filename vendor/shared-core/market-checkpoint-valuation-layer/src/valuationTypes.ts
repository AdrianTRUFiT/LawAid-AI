export type ValueClass =
  | "low"
  | "standard"
  | "high"
  | "critical";

export type PremiumJudgment =
  | "JUSTIFIED_PREMIUM"
  | "STANDARD_RANGE"
  | "INFLATED_EXTRACTION";

export type CheckpointBurdenLevel =
  | "minimal"
  | "moderate"
  | "heavy"
  | "critical";

export interface RouteVariableSnapshot {
  routeId: string;
  distanceKm: number;
  weightKg: number;
  volumeM3: number;
  urgencyScore: number;
  weatherRiskScore: number;
  dependencyRiskScore: number;
  substituteAvailabilityScore: number;
  delayToleranceScore: number;
  consequenceOfFailureScore: number;
  valueClass: ValueClass;
  mode: string;
}

export interface CheckpointBurdenSnapshot {
  checkpointId: string;
  nodeId: string;
  burdenLevel: CheckpointBurdenLevel;
  handlingComplexityScore: number;
  documentationComplexityScore: number;
  complianceRiskScore: number;
  timingSensitivityScore: number;
  requiredManualInterventionScore: number;
}

export interface HoldNodeValueSnapshot {
  nodeId: string;
  optionalityPreservationScore: number;
  stagingUtilityScore: number;
  relayUtilityScore: number;
  costReliefScore: number;
  timingImprovementScore: number;
  strategicHoldValueScore: number;
}

export interface FairValueRange {
  minimumReasonable: number;
  marketClearedEstimate: number;
  maximumReasonable: number;
  currency: string;
}

export interface ValuationFlag {
  flagId: string;
  category:
    | "pressure"
    | "burden"
    | "premium"
    | "inflation"
    | "hold_node"
    | "continuity";
  severity: "low" | "medium" | "high";
  message: string;
}

export interface CheckpointValuationResult {
  routeId: string;
  checkpointId: string;
  fairValueRange: FairValueRange;
  proposedCharge: number;
  premiumJudgment: PremiumJudgment;
  justifiedPremiumAmount: number;
  inflationAmount: number;
  burdenScore: number;
  pressureScore: number;
  holdNodeStrategicValue: number;
  flags: ValuationFlag[];
  rationale: string[];
}

export interface MarketCheckpointValuationInput {
  route: RouteVariableSnapshot;
  checkpoint: CheckpointBurdenSnapshot;
  holdNode?: HoldNodeValueSnapshot | null;
  proposedCharge: number;
  currency: string;
}