import { evaluateCheckpointValuation } from "../src/index.js";

const result = evaluateCheckpointValuation({
  route: {
    routeId: "route_inflation_001",
    distanceKm: 100,
    weightKg: 50,
    volumeM3: 1.5,
    urgencyScore: 25,
    weatherRiskScore: 10,
    dependencyRiskScore: 15,
    substituteAvailabilityScore: 85,
    delayToleranceScore: 85,
    consequenceOfFailureScore: 20,
    valueClass: "low",
    mode: "truck",
  },
  checkpoint: {
    checkpointId: "cp_inflation_001",
    nodeId: "node_inflation_001",
    burdenLevel: "minimal",
    handlingComplexityScore: 10,
    documentationComplexityScore: 8,
    complianceRiskScore: 5,
    timingSensitivityScore: 10,
    requiredManualInterventionScore: 5,
  },
  holdNode: null,
  proposedCharge: 250,
  currency: "USD",
});

if (result.premiumJudgment !== "INFLATED_EXTRACTION") {
  throw new Error(`Expected INFLATED_EXTRACTION but received ${result.premiumJudgment}`);
}

if (result.inflationAmount <= 0) {
  throw new Error("Expected positive inflation amount.");
}

console.log("SMOKE_MARKET_CHECKPOINT_INFLATION=PASS");