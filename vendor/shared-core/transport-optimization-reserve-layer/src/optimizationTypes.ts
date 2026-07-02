import type { ConsolidationGroup, FlowUnit, RoutePlan, TransportNode } from "../../transport-flow-layer/src/index.js";

export type OptimizationMode = "disabled" | "observe" | "recommend";

export type OptimizationRecommendationType =
  | "FILL_RATE_IMPROVEMENT"
  | "BACKHAUL_MATCH"
  | "DWELL_REDUCTION"
  | "BOTTLENECK_RELIEF"
  | "ROUTE_STRESS_ALERT"
  | "CONSOLIDATION_OPPORTUNITY"
  | "DECONSOLIDATION_REBALANCE";

export type OptimizationSeverity = "low" | "medium" | "high";

export interface TransportOptimizationInput {
  mode: OptimizationMode;
  flowUnits: FlowUnit[];
  nodes: TransportNode[];
  routePlans: RoutePlan[];
  consolidationGroups?: ConsolidationGroup[];
}

export interface FillRateSnapshot {
  groupId: string;
  capacityUsed: number;
  capacityMax: number;
  fillRate: number;
}

export interface DwellSnapshot {
  nodeId: string;
  queueDepth: number;
  throughputLimitPerHour: number;
  estimatedDwellHours: number;
}

export interface RouteStressSnapshot {
  routeId: string;
  totalLegs: number;
  transferPoints: number;
  fallbackRoutes: number;
  stressScore: number;
}

export interface BottleneckSnapshot {
  nodeId: string;
  queueDepth: number;
  throughputLimitPerHour: number;
  bottleneckScore: number;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  type: OptimizationRecommendationType;
  severity: OptimizationSeverity;
  reason: string;
  targetId: string;
  action: string;
  projectedBenefitScore: number;
}

export interface TransportOptimizationResult {
  mode: OptimizationMode;
  recommendations: OptimizationRecommendation[];
  fillRates: FillRateSnapshot[];
  dwellSnapshots: DwellSnapshot[];
  routeStress: RouteStressSnapshot[];
  bottlenecks: BottleneckSnapshot[];
  recommendationCount: number;
  optimizerApplied: boolean;
}