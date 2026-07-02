import {
  createRoutePlan,
  createTransportNode,
  evaluateCheckpoint,
  validateFlowStateTransition,
  type FlowUnit,
} from "../src/index.js";

const origin = createTransportNode({
  nodeId: "origin_002",
  nodeType: "origin",
  locationCode: "ORIGIN",
  maxUnits: 100,
  throughputLimitPerHour: 30,
});

const receiver = createTransportNode({
  nodeId: "receiver_002",
  nodeType: "receiver",
  locationCode: "RECEIVER",
  maxUnits: 100,
  throughputLimitPerHour: 20,
});

const routePlan = createRoutePlan({
  routeId: "route_002",
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
      nodeId: receiver.nodeId,
      nodeType: receiver.nodeType,
      expectedStateOnArrival: "OUT_FOR_DELIVERY",
      expectedStateOnDeparture: "DELIVERED",
    },
  ],
});

const flowUnit: FlowUnit = {
  flowUnitId: "flow_002",
  flowUnitType: "package",
  originNodeId: origin.nodeId,
  destinationNodeId: receiver.nodeId,
  currentNodeId: origin.nodeId,
  currentState: "CREATED",
  routePlan,
  checkpointHistory: [],
  complianceStatus: "pending",
  priority: 1,
  utilizationValue: 10,
  proofArtifacts: [],
};

const evaluated = evaluateCheckpoint({
  flowUnit,
  node: origin,
  checkpointId: "cp_origin_hold",
  checkpointType: "origin_validation",
  actor: "operator",
  docsComplete: false,
  ownerConfirmed: true,
});

if (evaluated.checkpoint.decision !== "HOLD") {
  throw new Error(`Expected HOLD but received ${evaluated.checkpoint.decision}`);
}

const transition = validateFlowStateTransition({
  flowUnit,
  nextState: evaluated.suggestedNextState,
});

if (!transition.ok) {
  throw new Error(transition.reason);
}

console.log("SMOKE_TRANSPORT_CHECKPOINT_HOLD=PASS");