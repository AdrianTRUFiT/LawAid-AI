import {
  canConsolidate,
  createConsolidationGroup,
  createRoutePlan,
  type FlowUnit,
} from "../src/index.js";

const routePlan = createRoutePlan({
  routeId: "route_003",
  laneSequence: [
    {
      sequence: 1,
      nodeId: "origin_a",
      nodeType: "origin",
      expectedStateOnArrival: "CREATED",
    },
    {
      sequence: 2,
      nodeId: "receiver_shared",
      nodeType: "receiver",
      expectedStateOnArrival: "DELIVERED",
    },
  ],
});

const flowA: FlowUnit = {
  flowUnitId: "flow_a",
  flowUnitType: "package",
  originNodeId: "origin_a",
  destinationNodeId: "receiver_shared",
  currentNodeId: "origin_a",
  currentState: "ARRIVED_AT_COLLECTION_NODE",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 15,
  proofArtifacts: [],
};

const flowB: FlowUnit = {
  flowUnitId: "flow_b",
  flowUnitType: "package",
  originNodeId: "origin_b",
  destinationNodeId: "receiver_shared",
  currentNodeId: "origin_b",
  currentState: "ARRIVED_AT_COLLECTION_NODE",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 20,
  proofArtifacts: [],
};

const check = canConsolidate({
  flowUnits: [flowA, flowB],
  capacityMax: 50,
});

if (!check.ok) {
  throw new Error(check.reason);
}

const group = createConsolidationGroup({
  memberIds: [flowA.flowUnitId, flowB.flowUnitId],
  capacityUsed: check.capacityUsed,
  capacityMax: 50,
  direction: "outbound",
  deconsolidationNodeId: "receiver_shared",
});

if (group.memberIds.length !== 2) {
  throw new Error("Expected 2 members in consolidation group.");
}

console.log("SMOKE_TRANSPORT_CONSOLIDATION=PASS");