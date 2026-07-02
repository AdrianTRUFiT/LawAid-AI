import { evaluateCheckpointValuation } from "../src/index.js";

const result = evaluateCheckpointValuation({
  route: {
    routeId: "route_standard_001",
    distanceKm: 120,
    weightKg: 80,
    volumeM3: 2,
    urgencyScore: 40,
    weatherRiskScore: 20,
    dependencyRiskScore: 30,
    substituteAvailabilityScore: 80,
    delayToleranceScore: 70,
    consequenceOfFailureScore: 35,
    valueClass: "standard",
    mode: "truck",
  },
  checkpoint: {
    checkpointId: "cp_standard_001",
    nodeId: "node_standard_001",
    burdenLevel: "moderate",
    handlingComplexityScore: 35,
    documentationComplexityScore: 30,
    complianceRiskScore: 20,
    timingSensitivityScore: 25,
    requiredManualInterventionScore: 15,
  },
  holdNode: null,
  proposedCharge: 25,
  currency: "USD",
});

if (result.premiumJudgment !== "STANDARD_RANGE") {
  throw new Error(`Expected STANDARD_RANGE but received ${result.premiumJudgment}`);
}

console.log("SMOKE_MARKET_CHECKPOINT_STANDARD=PASS");