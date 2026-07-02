import {
  createConsolidationGroup,
  createRoutePlan,
  createTransportNode,
  type FlowUnit,
} from "../../transport-flow-layer/src/index.js";
import { runTransportOptimizationReserve } from "../src/index.js";

const node = createTransportNode({
  nodeId: "node_observe",
  nodeType: "warehouse",
  locationCode: "WH-OBS",
  maxUnits: 100,
  throughputLimitPerHour: 10,
  queueDepth: 40,
});

const routePlan = createRoutePlan({
  routeId: "route_observe",
  laneSequence: [
    {
      sequence: 1,
      nodeId: "origin_observe",
      nodeType: "origin",
      expectedStateOnArrival: "CREATED",
    },
    {
      sequence: 2,
      nodeId: "hub_observe",
      nodeType: "regional_hub",
      expectedStateOnArrival: "ARRIVED_AT_REGIONAL_HUB",
    },
    {
      sequence: 3,
      nodeId: "receiver_observe",
      nodeType: "receiver",
      expectedStateOnArrival: "DELIVERED",
    },
  ],
  expectedTransferPoints: ["hub_observe"],
});

const flowUnit: FlowUnit = {
  flowUnitId: "flow_observe",
  flowUnitType: "package",
  originNodeId: "origin_observe",
  destinationNodeId: "receiver_observe",
  currentNodeId: "hub_observe",
  currentState: "ARRIVED_AT_COLLECTION_NODE",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 12,
  proofArtifacts: [],
};

const group = createConsolidationGroup({
  memberIds: ["flow_observe"],
  capacityUsed: 12,
  capacityMax: 50,
  direction: "outbound",
});

const result = runTransportOptimizationReserve({
  mode: "observe",
  flowUnits: [flowUnit],
  nodes: [node],
  routePlans: [routePlan],
  consolidationGroups: [group],
});

if (!result.optimizerApplied || result.recommendationCount < 1) {
  throw new Error("Expected observe mode to produce recommendations.");
}

console.log("SMOKE_TRANSPORT_OPTIMIZATION_OBSERVE=PASS");