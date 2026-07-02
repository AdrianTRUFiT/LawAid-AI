import { evaluateCheckpointValuation } from "../src/index.js";

const result = evaluateCheckpointValuation({
  route: {
    routeId: "route_hold_001",
    distanceKm: 220,
    weightKg: 60,
    volumeM3: 3,
    urgencyScore: 60,
    weatherRiskScore: 45,
    dependencyRiskScore: 40,
    substituteAvailabilityScore: 50,
    delayToleranceScore: 40,
    consequenceOfFailureScore: 70,
    valueClass: "high",
    mode: "mixed",
  },
  checkpoint: {
    checkpointId: "cp_hold_001",
    nodeId: "node_hold_001",
    burdenLevel: "moderate",
    handlingComplexityScore: 45,
    documentationComplexityScore: 40,
    complianceRiskScore: 35,
    timingSensitivityScore: 60,
    requiredManualInterventionScore: 30,
  },
  holdNode: {
    nodeId: "hold_002",
    optionalityPreservationScore: 90,
    stagingUtilityScore: 88,
    relayUtilityScore: 70,
    costReliefScore: 75,
    timingImprovementScore: 80,
    strategicHoldValueScore: 92,
  },
  proposedCharge: 95,
  currency: "USD",
});

if (result.holdNodeStrategicValue <= 0) {
  throw new Error("Expected positive hold-node strategic value.");
}

console.log("SMOKE_MARKET_CHECKPOINT_HOLD_NODE=PASS");