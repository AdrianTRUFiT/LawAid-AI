import { runBizTechWellnessEvaluation } from "../src/index.js";

const result = runBizTechWellnessEvaluation({
  subjectId: "btw_002",
  ascent: {
    subjectId: "btw_002",
    currentStage: "LAYER_2",
    targetStage: "LAYER_3",
    decision: "HOLD",
    totalPressureScore: 0.58,
    dominantPressure: "logistics",
    narrowingProfile: {
      currentStageWeight: 2,
      targetStageWeight: 3,
      narrowingDelta: 1,
    },
    lawfulProgression: true,
    reason: "Ascent held because pressure or maturity risk suggests stabilization first.",
    createdAt: new Date().toISOString(),
  },
  energy: {
    subjectId: "btw_002",
    translation: {
      timeCostScore: 0.4,
      energyCostScore: 0.42,
      savedEnergyScore: 0.58,
    },
    cognitiveLoad: {
      cognitiveLoadClass: "guarded",
      cognitiveLoadScore: 0.42,
    },
    depletion: {
      depletionRiskClass: "guarded",
      depletionRiskScore: 0.41,
    },
    stability: {
      stabilityBalanceClass: "strained",
      balanceScore: 0.56,
    },
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.recommendation !== "acceptable") {
  throw new Error("Expected acceptable recommendation.");
}

console.log("SMOKE_BIZTECH_WELLNESS_ACCEPTABLE=PASS");