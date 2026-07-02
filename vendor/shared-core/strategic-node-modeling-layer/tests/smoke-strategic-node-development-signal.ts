import { buildStrategicNodeModel } from "../src/index.js";

const model = buildStrategicNodeModel({
  nodeId: "node_dev_001",
  nodeType: "regional_hub",
  locationCode: "TX-HUB-001",
  maxCapacityUnits: 100,
  currentLoadUnits: 92,
  throughputPerHour: 12,
  queueDepth: 35,
  dwellHoursEstimate: 4,
  alternativeNodeCount: 1,
  routeDemandScore: 82,
  serviceGapScore: 78,
  landUtilityScore: 88,
  stagingSuitabilityScore: 80,
  relaySuitabilityScore: 77,
});

const hasDevelopmentSignal = model.opportunitySignals.some(
  (x) => x.opportunityType === "development_signal",
);

if (!hasDevelopmentSignal) {
  throw new Error("Expected development signal.");
}

console.log("SMOKE_STRATEGIC_NODE_DEVELOPMENT_SIGNAL=PASS");