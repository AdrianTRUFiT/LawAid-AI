import { runInvestigativeInference } from "../src/index.js";

const result = runInvestigativeInference({
  subjectId: "asset_003",
  anomalies: [
    {
      anomalyId: "an_003",
      subjectId: "asset_003",
      sourceId: "source_bad",
      category: "bad_score",
      severity: "high",
      score: 1.5,
      observedAt: new Date().toISOString(),
    },
  ],
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_ANOMALY_SCORE") {
  throw new Error("Expected invalid anomaly score refusal.");
}

console.log("SMOKE_INVESTIGATIVE_INFERENCE_INVALID_SCORE=PASS");