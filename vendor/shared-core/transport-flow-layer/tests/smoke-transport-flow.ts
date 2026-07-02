import {
  createRoutePlan,
  createTransportNode,
  validateRoutePlan,
  type FlowUnit,
} from "../src/index.js";

const origin = createTransportNode({
  nodeId: "origin_001",
  nodeType: "origin",
  locationCode: "MX-ORI",
  maxUnits: 100,
  throughputLimitPerHour: 30,
});

const consolidation = createTransportNode({
  nodeId: "consolidation_001",
  nodeType: "consolidation",
  locationCode: "TX-HUB",
  maxUnits: 500,
  throughputLimitPerHour: 80,
});

const receiver = createTransportNode({
  nodeId: "receiver_001",
  nodeType: "receiver",
  locationCode: "FL-REC",
  maxUnits: 200,
  throughputLimitPerHour: 40,
});

const routePlan = createRoutePlan({
  routeId: "route_001",
  laneSequence: [
    {
      sequence: 1,
      nodeId: origin.nodeId,
      nodeType: origin.nodeType,
      expectedStateOnArrival: "CREATED",
      expectedStateOnDeparture: "READY_FOR_PICKUP",
    },
    {
      sequence: 2,
      nodeId: consolidation.nodeId,
      nodeType: consolidation.nodeType,
      expectedStateOnArrival: "ARRIVED_AT_COLLECTION_NODE",
      expectedStateOnDeparture: "CONSOLIDATED",
    },
    {
      sequence: 3,
      nodeId: receiver.nodeId,
      nodeType: receiver.nodeType,
      expectedStateOnArrival: "OUT_FOR_DELIVERY",
      expectedStateOnDeparture: "DELIVERED",
    },
  ],
  transportModes: ["truck", "linehaul"],
  expectedTransferPoints: [consolidation.nodeId],
});

const flowUnit: FlowUnit = {
  flowUnitId: "flow_001",
  flowUnitType: "inventory_group",
  originNodeId: origin.nodeId,
  destinationNodeId: receiver.nodeId,
  currentNodeId: origin.nodeId,
  currentState: "CREATED",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 25,
  proofArtifacts: [],
};

const validation = validateRoutePlan({
  routePlan: flowUnit.routePlan,
  originNodeId: flowUnit.originNodeId,
  destinationNodeId: flowUnit.destinationNodeId,
  availableNodes: [origin, consolidation, receiver],
});

if (!validation.ok) {
  throw new Error(validation.reason);
}

console.log("SMOKE_TRANSPORT_FLOW=PASS");