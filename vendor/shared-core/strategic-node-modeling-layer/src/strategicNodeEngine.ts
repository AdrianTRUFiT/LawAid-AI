import type {
  StrategicNodeInput,
  StrategicNodeModel,
  StrategicNodeModelingResult,
} from "./nodeModelTypes.js";
import { buildNodeCapacitySnapshot } from "./capacityModeler.js";
import { buildOpportunitySignals } from "./opportunityEngine.js";
import { buildNodePressureSnapshot } from "./pressureModeler.js";
import { buildStrategicNodeRecommendations } from "./recommendationEngine.js";
import { round2 } from "./nodeModelUtils.js";

function computeStrategicValueScore(input: {
  capacityUtilizationRate: number;
  pressureScore: number;
  opportunityCount: number;
  landUtilityScore: number;
  serviceGapScore: number;
}): number {
  return round2(
    input.capacityUtilizationRate * 0.18 +
    input.pressureScore * 0.22 +
    input.opportunityCount * 8 +
    input.landUtilityScore * 0.22 +
    input.serviceGapScore * 0.18,
  );
}

export function buildStrategicNodeModel(
  node: StrategicNodeInput,
): StrategicNodeModel {
  const capacity = buildNodeCapacitySnapshot(node);
  const pressure = buildNodePressureSnapshot(node);
  const opportunitySignals = buildOpportunitySignals(node);
  const recommendations = buildStrategicNodeRecommendations({
    node,
    pressure,
    opportunities: opportunitySignals,
  });

  return {
    nodeId: node.nodeId,
    nodeType: node.nodeType,
    locationCode: node.locationCode,
    capacity,
    pressure,
    opportunitySignals,
    recommendations,
    strategicValueScore: computeStrategicValueScore({
      capacityUtilizationRate: capacity.utilizationRate,
      pressureScore: pressure.pressureScore,
      opportunityCount: opportunitySignals.length,
      landUtilityScore: node.landUtilityScore,
      serviceGapScore: node.serviceGapScore,
    }),
    generatedAt: new Date().toISOString(),
  };
}

export function buildStrategicNodeModelingResult(
  nodes: StrategicNodeInput[],
): StrategicNodeModelingResult {
  const models = nodes.map(buildStrategicNodeModel);

  return {
    models,
    modelCount: models.length,
  };
}