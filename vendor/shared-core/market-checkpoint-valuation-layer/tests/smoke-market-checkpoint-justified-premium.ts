import { evaluateCheckpointValuation } from "../src/index.js";

const result = evaluateCheckpointValuation({
  route: {
    routeId: "route_premium_001",
    distanceKm: 300,
    weightKg: 140,
    volumeM3: 4,
    urgencyScore: 88,
    weatherRiskScore: 55,
    dependencyRiskScore: 70,
    substituteAvailabilityScore: 20,
    delayToleranceScore: 15,
    consequenceOfFailureScore: 90,
    valueClass: "critical",
    mode: "air",
  },
  checkpoint: {
    checkpointId: "cp_premium_001",
    nodeId: "node_premium_001",
    burdenLevel: "heavy",
    handlingComplexityScore: 70,
    documentationComplexityScore: 65,
    complianceRiskScore: 60,
    timingSensitivityScore: 85,
    requiredManualInterventionScore: 55,
  },
  holdNode: {
    nodeId: "hold_001",
    optionalityPreservationScore: 80,
    stagingUtilityScore: 72,
    relayUtilityScore: 68,
    costReliefScore: 60,
    timingImprovementScore: 75,
    strategicHoldValueScore: 82,
  },
  proposedCharge: 95,
  currency: "USD",
});

if (result.premiumJudgment !== "JUSTIFIED_PREMIUM") {
  throw new Error(`Expected JUSTIFIED_PREMIUM but received ${result.premiumJudgment}`);
}

if (result.justifiedPremiumAmount <= 0) {
  throw new Error("Expected positive justified premium amount.");
}

console.log("SMOKE_MARKET_CHECKPOINT_JUSTIFIED_PREMIUM=PASS");