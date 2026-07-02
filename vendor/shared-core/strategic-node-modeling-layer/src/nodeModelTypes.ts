export type StrategicNodeType =
  | "warehouse"
  | "cross_dock"
  | "regional_hub"
  | "border_node"
  | "compliance_node"
  | "staging_node"
  | "relay_node"
  | "receiver_node"
  | "generic";

export type NodePressureClass =
  | "stable"
  | "watch"
  | "strained"
  | "critical";

export type OpportunityType =
  | "capacity_expansion"
  | "staging_opportunity"
  | "relay_opportunity"
  | "development_signal"
  | "service_gap"
  | "timing_arbitrage"
  | "hold_node_upgrade";

export interface StrategicNodeInput {
  nodeId: string;
  nodeType: StrategicNodeType;
  locationCode: string;
  maxCapacityUnits: number;
  currentLoadUnits: number;
  throughputPerHour: number;
  queueDepth: number;
  dwellHoursEstimate: number;
  alternativeNodeCount: number;
  routeDemandScore: number;
  serviceGapScore: number;
  landUtilityScore: number;
  stagingSuitabilityScore: number;
  relaySuitabilityScore: number;
  complianceComplexityScore?: number;
}

export interface NodeCapacitySnapshot {
  nodeId: string;
  maxCapacityUnits: number;
  currentLoadUnits: number;
  utilizationRate: number;
  spareCapacityUnits: number;
}

export interface NodePressureSnapshot {
  nodeId: string;
  queueDepth: number;
  dwellHoursEstimate: number;
  routeDemandScore: number;
  pressureScore: number;
  pressureClass: NodePressureClass;
}

export interface NodeOpportunitySignal {
  signalId: string;
  nodeId: string;
  opportunityType: OpportunityType;
  confidence: number;
  rationale: string;
}

export interface StrategicNodeRecommendation {
  recommendationId: string;
  nodeId: string;
  action: string;
  reason: string;
  priority: "low" | "medium" | "high";
}

export interface StrategicNodeModel {
  nodeId: string;
  nodeType: StrategicNodeType;
  locationCode: string;
  capacity: NodeCapacitySnapshot;
  pressure: NodePressureSnapshot;
  opportunitySignals: NodeOpportunitySignal[];
  recommendations: StrategicNodeRecommendation[];
  strategicValueScore: number;
  generatedAt: string;
}

export interface StrategicNodeModelingResult {
  models: StrategicNodeModel[];
  modelCount: number;
}