import { runBizTechWellnessEvaluation } from "../src/index.js";

const result = runBizTechWellnessEvaluation({
  subjectId: "btw_001",
  ascent: {
    subjectId: "btw_001",
    currentStage: "GROUND_ZERO",
    targetStage: "LAYER_1",
    decision: "ASCEND",
    totalPressureScore: 0.25,
    dominantPressure: "time",
    narrowingProfile: {
      currentStageWeight: 0,
      targetStageWeight: 1,
      narrowingDelta: 1,
    },
    lawfulProgression: true,
    reason: "Lawful ascent permitted.",
    createdAt: new Date().toISOString(),
  },
  energy: {
    subjectId: "btw_001",
    translation: {
      timeCostScore: 0.15,
      energyCostScore: 0.2,
      savedEnergyScore: 0.8,
    },
    cognitiveLoad: {
      cognitiveLoadClass: "low",
      cognitiveLoadScore: 0.2,
    },
    depletion: {
      depletionRiskClass: "low",
      depletionRiskScore: 0.18,
    },
    stability: {
      stabilityBalanceClass: "stable",
      balanceScore: 0.84,
    },
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.recommendation !== "best") {
  throw new Error("Expected best recommendation.");
}

console.log("SMOKE_BIZTECH_WELLNESS_BEST=PASS");