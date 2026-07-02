import type {
  NodeOpportunitySignal,
  StrategicNodeInput,
} from "./nodeModelTypes.js";
import { makeId, round2 } from "./nodeModelUtils.js";

export function buildOpportunitySignals(
  node: StrategicNodeInput,
): NodeOpportunitySignal[] {
  const signals: NodeOpportunitySignal[] = [];

  if (node.currentLoadUnits >= node.maxCapacityUnits * 0.85 && node.landUtilityScore >= 70) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "capacity_expansion",
      confidence: round2(0.82),
      rationale: "Node is near capacity and surrounding utility suggests expansion viability.",
    });
  }

  if (node.stagingSuitabilityScore >= 75 && node.dwellHoursEstimate >= 2) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "staging_opportunity",
      confidence: round2(0.77),
      rationale: "Node supports timing preservation through stronger staging capability.",
    });
  }

  if (node.relaySuitabilityScore >= 70 && node.alternativeNodeCount <= 2) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "relay_opportunity",
      confidence: round2(0.73),
      rationale: "Node appears valuable as relay support where alternatives are sparse.",
    });
  }

  if (node.serviceGapScore >= 75) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "service_gap",
      confidence: round2(0.8),
      rationale: "Demand-service mismatch suggests unmet local support need.",
    });
  }

  if (node.landUtilityScore >= 80 && node.routeDemandScore >= 65) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "development_signal",
      confidence: round2(0.84),
      rationale: "Repeated pressure plus utility profile suggests development interest.",
    });
  }

  if (node.stagingSuitabilityScore >= 70 && node.routeDemandScore >= 60) {
    signals.push({
      signalId: makeId("signal"),
      nodeId: node.nodeId,
      opportunityType: "hold_node_upgrade",
      confidence: round2(0.71),
      rationale: "Node can preserve optionality and deserves hold-node evaluation.",
    });
  }

  return signals;
}