import { runInvestigativeInference } from "../src/index.js";

const result = runInvestigativeInference({
  subjectId: "asset_002",
  anomalies: [
    {
      anomalyId: "an_002a",
      subjectId: "asset_002",
      sourceId: "source_a",
      category: "spread_widening",
      severity: "moderate",
      score: 0.55,
      observedAt: new Date().toISOString(),
    },
    {
      anomalyId: "an_002b",
      subjectId: "asset_002",
      sourceId: "source_b",
      category: "order_imbalance",
      severity: "high",
      score: 0.72,
      observedAt: new Date().toISOString(),
    },
    {
      anomalyId: "an_002c",
      subjectId: "asset_002",
      sourceId: "source_c",
      category: "volatility_shift",
      severity: "moderate",
      score: 0.6,
      observedAt: new Date().toISOString(),
    },
  ],
});

if (!result.ok || !result.artifact || result.artifact.causalPressureAssessment.pressureClass === "low") {
  throw new Error("Expected corroborated pressure above low.");
}

console.log("SMOKE_INVESTIGATIVE_INFERENCE_CORROBORATED=PASS");