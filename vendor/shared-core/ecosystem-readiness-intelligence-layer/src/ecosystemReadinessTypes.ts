export type SettlementType =
  | "town"
  | "city"
  | "community";

export type EcosystemReadinessStatus =
  | "READINESS_HIGH"
  | "READINESS_TRANSITIONAL"
  | "READINESS_LOW";

export interface EcosystemReadinessInput {
  subjectId: string;
  settlementType: SettlementType;
  energyScore: number;
  waterWasteScore: number;
  shelterScore: number;
  productionScore: number;
  mobilityScore: number;
  foodScore: number;
  healthSafetyScore: number;
  governanceScore: number;
}

export interface EcosystemReadinessArtifact {
  ecosystemReadinessId: string;
  subjectId: string;
  settlementType: SettlementType;
  ecosystemReadinessStatus: EcosystemReadinessStatus;
  readinessCompositeScore: number;
  strongestLayer:
    | "energy"
    | "water_waste"
    | "shelter"
    | "production"
    | "mobility"
    | "food"
    | "health_safety"
    | "governance";
  weakestLayer:
    | "energy"
    | "water_waste"
    | "shelter"
    | "production"
    | "mobility"
    | "food"
    | "health_safety"
    | "governance";
  reason: string;
  createdAt: string;
}

export interface EcosystemReadinessRefusal {
  refusalCode:
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface EcosystemReadinessResult {
  ok: boolean;
  artifact: EcosystemReadinessArtifact | null;
  refusal: EcosystemReadinessRefusal | null;
}