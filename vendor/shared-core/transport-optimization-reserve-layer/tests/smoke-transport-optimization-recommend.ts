import {
  createConsolidationGroup,
  createRoutePlan,
  createTransportNode,
  type FlowUnit,
} from "../../transport-flow-layer/src/index.js";
import { runTransportOptimizationReserve } from "../src/index.js";

const nodeA = createTransportNode({
  nodeId: "node_a",
  nodeType: "warehouse",
  locationCode: "WH-A",
  maxUnits: 100,
  throughputLimitPerHour: 10,
  queueDepth: 50,
});

const nodeB = createTransportNode({
  nodeId: "node_b",
  nodeType: "cross_dock",
  locationCode: "XD-B",
  maxUnits: 100,
  throughputLimitPerHour: 8,
  queueDepth: 20,
});

const routePlan = createRoutePlan({
  routeId: "route_recommend",
  laneSequence: [
    {
      sequence: 1,
      nodeId: "origin_r",
      nodeType: "origin",
      expectedStateOnArrival: "CREATED",
    },
    {
      sequence: 2,
      nodeId: "node_a",
      nodeType: "warehouse",
      expectedStateOnArrival: "STAGED",
    },
    {
      sequence: 3,
      nodeId: "node_b",
      nodeType: "cross_dock",
      expectedStateOnArrival: "STAGED",
    },
    {
      sequence: 4,
      nodeId: "receiver_r",
      nodeType: "receiver",
      expectedStateOnArrival: "DELIVERED",
    },
  ],
  expectedTransferPoints: ["node_a", "node_b"],
  fallbackRouteIds: [],
});

const flowUnit: FlowUnit = {
  flowUnitId: "flow_recommend",
  flowUnitType: "inventory_group",
  originNodeId: "origin_r",
  destinationNodeId: "receiver_r",
  currentNodeId: "node_a",
  currentState: "STAGED",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 15,
  proofArtifacts: [],
};

const group = createConsolidationGroup({
  memberIds: ["flow_recommend"],
  capacityUsed: 15,
  capacityMax: 80,
  direction: "outbound",
});

const result = runTransportOptimizationReserve({
  mode: "recommend",
  flowUnits: [flowUnit],
  nodes: [nodeA, nodeB],
  routePlans: [routePlan],
  consolidationGroups: [group],
});

if (!result.optimizerApplied || result.recommendationCount < 2) {
  throw new Error("Expected recommend mode to produce multiple recommendations.");
}

console.log("SMOKE_TRANSPORT_OPTIMIZATION_RECOMMEND=PASS");