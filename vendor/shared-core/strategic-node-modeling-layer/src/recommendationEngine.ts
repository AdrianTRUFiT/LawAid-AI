import type {
  NodeOpportunitySignal,
  NodePressureSnapshot,
  StrategicNodeInput,
  StrategicNodeRecommendation,
} from "./nodeModelTypes.js";
import { makeId } from "./nodeModelUtils.js";

export function buildStrategicNodeRecommendations(input: {
  node: StrategicNodeInput;
  pressure: NodePressureSnapshot;
  opportunities: NodeOpportunitySignal[];
}): StrategicNodeRecommendation[] {
  const recommendations: StrategicNodeRecommendation[] = [];

  if (input.pressure.pressureClass === "critical") {
    recommendations.push({
      recommendationId: makeId("rec"),
      nodeId: input.node.nodeId,
      action: "Immediately rebalance flow or add temporary relief capacity.",
      reason: "Node pressure is critical.",
      priority: "high",
    });
  } else if (input.pressure.pressureClass === "strained") {
    recommendations.push({
      recommendationId: makeId("rec"),
      nodeId: input.node.nodeId,
      action: "Reduce queue formation and improve throughput planning.",
      reason: "Node pressure is strained.",
      priority: "medium",
    });
  }

  for (const signal of input.opportunities) {
    if (signal.opportunityType === "capacity_expansion") {
      recommendations.push({
        recommendationId: makeId("rec"),
        nodeId: input.node.nodeId,
        action: "Evaluate permanent expansion or nearby overflow support.",
        reason: signal.rationale,
        priority: "high",
      });
    }

    if (signal.opportunityType === "staging_opportunity") {
      recommendations.push({
        recommendationId: makeId("rec"),
        nodeId: input.node.nodeId,
        action: "Model this node as a formal staging instrument.",
        reason: signal.rationale,
        priority: "medium",
      });
    }

    if (signal.opportunityType === "development_signal") {
      recommendations.push({
        recommendationId: makeId("rec"),
        nodeId: input.node.nodeId,
        action: "Flag this corridor for development and land-intelligence review.",
        reason: signal.rationale,
        priority: "high",
      });
    }

    if (signal.opportunityType === "service_gap") {
      recommendations.push({
        recommendationId: makeId("rec"),
        nodeId: input.node.nodeId,
        action: "Investigate unmet service demand around this node.",
        reason: signal.rationale,
        priority: "medium",
      });
    }
  }

  if (recommendations.length === 0) {
    recommendations.push({
      recommendationId: makeId("rec"),
      nodeId: input.node.nodeId,
      action: "Maintain current monitoring and preserve node legibility.",
      reason: "Node currently shows no urgent intervention requirement.",
      priority: "low",
    });
  }

  return recommendations;
}