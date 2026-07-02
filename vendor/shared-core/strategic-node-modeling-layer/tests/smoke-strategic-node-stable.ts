import { buildStrategicNodeModel } from "../src/index.js";

const model = buildStrategicNodeModel({
  nodeId: "node_stable_001",
  nodeType: "warehouse",
  locationCode: "FL-WH-001",
  maxCapacityUnits: 100,
  currentLoadUnits: 40,
  throughputPerHour: 20,
  queueDepth: 5,
  dwellHoursEstimate: 0.5,
  alternativeNodeCount: 5,
  routeDemandScore: 30,
  serviceGapScore: 20,
  landUtilityScore: 40,
  stagingSuitabilityScore: 45,
  relaySuitabilityScore: 35,
});

if (model.pressure.pressureClass !== "stable" && model.pressure.pressureClass !== "watch") {
  throw new Error(`Unexpected pressure class ${model.pressure.pressureClass}`);
}

console.log("SMOKE_STRATEGIC_NODE_STABLE=PASS");