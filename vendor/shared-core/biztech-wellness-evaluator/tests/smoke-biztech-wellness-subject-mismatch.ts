import { runBizTechWellnessEvaluation } from "../src/index.js";

const result = runBizTechWellnessEvaluation({
  subjectId: "btw_004",
  ascent: {
    subjectId: "btw_004",
    currentStage: "GROUND_ZERO",
    targetStage: "LAYER_1",
    decision: "ASCEND",
    totalPressureScore: 0.2,
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
    subjectId: "wrong_subject",
    translation: {
      timeCostScore: 0.2,
      energyCostScore: 0.2,
      savedEnergyScore: 0.8,
    },
    cognitiveLoad: {
      cognitiveLoadClass: "low",
      cognitiveLoadScore: 0.2,
    },
    depletion: {
      depletionRiskClass: "low",
      depletionRiskScore: 0.2,
    },
    stability: {
      stabilityBalanceClass: "stable",
      balanceScore: 0.8,
    },
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_BIZTECH_WELLNESS_SUBJECT_MISMATCH=PASS");