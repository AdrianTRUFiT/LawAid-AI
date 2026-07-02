export type SlotState =
  | "open"
  | "occupied"
  | "reserved"
  | "blocked"
  | "authorization_required";

export type CapacityResistanceClass =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export interface LogisticsSearchBoxQuery {
  queryId: string;
  origin: string;
  destination: string;
  whenNeeded?: string;
  cargoClass?: string;
  weightKg?: number;
  volumeM3?: number;
  urgencyScore?: number;
  objective?: "fastest" | "cheapest" | "balanced";
}

export interface SlotInventoryRecord {
  slotId: string;
  nodeId: string;
  laneId: string;
  state: SlotState;
  distanceToDestinationKm: number;
  estimatedHoursToDestination: number;
  authorizationRequired: boolean;
  occupiedUnits: number;
  maxUnits: number;
  downstreamFrictionScore: number;
  checkpointBurdenScore: number;
  holdNodeBenefitScore: number;
  costEstimate: number;
}

export interface SlotCapacitySnapshot {
  slotId: string;
  nodeId: string;
  utilizationRate: number;
  remainingUnits: number;
  resistanceScore: number;
  resistanceClass: CapacityResistanceClass;
}

export interface OrchestratedSlotOption {
  slotId: string;
  nodeId: string;
  laneId: string;
  state: SlotState;
  nearestToDestination: boolean;
  authorizationRequired: boolean;
  usableNow: boolean;
  estimatedHoursToDestination: number;
  distanceToDestinationKm: number;
  costEstimate: number;
  downstreamFrictionScore: number;
  checkpointBurdenScore: number;
  holdNodeBenefitScore: number;
  resistanceScore: number;
  totalScore: number;
  why: string[];
  who: string[];
  what: string[];
  where: string[];
  when: string[];
  how: string[];
}

export interface SlotCapacitySearchResponse {
  queryId: string;
  origin: string;
  destination: string;
  objective: "fastest" | "cheapest" | "balanced";
  bestOption: OrchestratedSlotOption;
  rankedOptions: OrchestratedSlotOption[];
  summary: {
    totalSlotsSeen: number;
    openCount: number;
    occupiedCount: number;
    reservedCount: number;
    blockedCount: number;
    authorizationRequiredCount: number;
  };
  generatedAt: string;
}