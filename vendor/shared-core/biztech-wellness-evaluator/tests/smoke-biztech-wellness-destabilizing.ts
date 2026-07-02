import { runBizTechWellnessEvaluation } from "../src/index.js";

const result = runBizTechWellnessEvaluation({
  subjectId: "btw_003",
  ascent: {
    subjectId: "btw_003",
    currentStage: "LAYER_5",
    targetStage: "LAYER_6",
    decision: "HOLD",
    totalPressureScore: 0.88,
    dominantPressure: "money",
    narrowingProfile: {
      currentStageWeight: 5,
      targetStageWeight: 6,
      narrowingDelta: 1,
    },
    lawfulProgression: true,
    reason: "Ascent held because pressure or maturity risk suggests stabilization first.",
    createdAt: new Date().toISOString(),
  },
  energy: {
    subjectId: "btw_003",
    translation: {
      timeCostScore: 0.9,
      energyCostScore: 0.92,
      savedEnergyScore: 0.08,
    },
    cognitiveLoad: {
      cognitiveLoadClass: "high",
      cognitiveLoadScore: 0.89,
    },
    depletion: {
      depletionRiskClass: "high",
      depletionRiskScore: 0.91,
    },
    stability: {
      stabilityBalanceClass: "depleted",
      balanceScore: 0.1,
    },
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.recommendation !== "costly") {
  throw new Error("Expected costly recommendation.");
}

console.log("SMOKE_BIZTECH_WELLNESS_DESTABILIZING=PASS");