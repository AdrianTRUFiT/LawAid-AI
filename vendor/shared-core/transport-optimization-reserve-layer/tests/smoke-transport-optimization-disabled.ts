import { createRoutePlan, createTransportNode, type FlowUnit } from "../../transport-flow-layer/src/index.js";
import { runTransportOptimizationReserve } from "../src/index.js";

const node = createTransportNode({
  nodeId: "node_disabled",
  nodeType: "warehouse",
  locationCode: "WH-001",
  maxUnits: 100,
  throughputLimitPerHour: 20,
  queueDepth: 10,
});

const routePlan = createRoutePlan({
  routeId: "route_disabled",
  laneSequence: [
    {
      sequence: 1,
      nodeId: "node_disabled",
      nodeType: "warehouse",
      expectedStateOnArrival: "STAGED",
    },
    {
      sequence: 2,
      nodeId: "receiver_disabled",
      nodeType: "receiver",
      expectedStateOnArrival: "DELIVERED",
    },
  ],
});

const flowUnit: FlowUnit = {
  flowUnitId: "flow_disabled",
  flowUnitType: "package",
  originNodeId: "node_disabled",
  destinationNodeId: "receiver_disabled",
  currentNodeId: "node_disabled",
  currentState: "STAGED",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 10,
  proofArtifacts: [],
};

const result = runTransportOptimizationReserve({
  mode: "disabled",
  flowUnits: [flowUnit],
  nodes: [node],
  routePlans: [routePlan],
  consolidationGroups: [],
});

if (result.optimizerApplied || result.recommendationCount !== 0) {
  throw new Error("Expected disabled optimizer to short-circuit.");
}

console.log("SMOKE_TRANSPORT_OPTIMIZATION_DISABLED=PASS");