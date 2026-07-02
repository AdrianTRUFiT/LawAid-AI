import { buildStrategicNodeModelingResult } from "../src/index.js";

const result = buildStrategicNodeModelingResult([
  {
    nodeId: "node_multi_001",
    nodeType: "warehouse",
    locationCode: "A",
    maxCapacityUnits: 100,
    currentLoadUnits: 30,
    throughputPerHour: 15,
    queueDepth: 6,
    dwellHoursEstimate: 1,
    alternativeNodeCount: 4,
    routeDemandScore: 35,
    serviceGapScore: 25,
    landUtilityScore: 40,
    stagingSuitabilityScore: 45,
    relaySuitabilityScore: 30,
  },
  {
    nodeId: "node_multi_002",
    nodeType: "regional_hub",
    locationCode: "B",
    maxCapacityUnits: 100,
    currentLoadUnits: 88,
    throughputPerHour: 10,
    queueDepth: 28,
    dwellHoursEstimate: 3.5,
    alternativeNodeCount: 1,
    routeDemandScore: 76,
    serviceGapScore: 72,
    landUtilityScore: 85,
    stagingSuitabilityScore: 74,
    relaySuitabilityScore: 70,
  },
]);

if (result.modelCount !== 2) {
  throw new Error(`Expected 2 models but received ${result.modelCount}`);
}

console.log("SMOKE_STRATEGIC_NODE_MODELING_RESULT=PASS");