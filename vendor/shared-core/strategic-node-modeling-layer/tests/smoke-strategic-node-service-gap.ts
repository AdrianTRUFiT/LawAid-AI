import { buildStrategicNodeModel } from "../src/index.js";

const model = buildStrategicNodeModel({
  nodeId: "node_gap_001",
  nodeType: "staging_node",
  locationCode: "ORL-STG-001",
  maxCapacityUnits: 60,
  currentLoadUnits: 52,
  throughputPerHour: 8,
  queueDepth: 20,
  dwellHoursEstimate: 3,
  alternativeNodeCount: 2,
  routeDemandScore: 68,
  serviceGapScore: 84,
  landUtilityScore: 65,
  stagingSuitabilityScore: 85,
  relaySuitabilityScore: 72,
});

const hasServiceGap = model.opportunitySignals.some(
  (x) => x.opportunityType === "service_gap",
);

if (!hasServiceGap) {
  throw new Error("Expected service gap signal.");
}

console.log("SMOKE_STRATEGIC_NODE_SERVICE_GAP=PASS");