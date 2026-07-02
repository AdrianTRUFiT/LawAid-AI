import { runInvestigativeInference } from "../src/index.js";

const result = runInvestigativeInference({
  subjectId: "asset_001",
  anomalies: [
    {
      anomalyId: "an_001",
      subjectId: "asset_001",
      sourceId: "source_a",
      category: "volume_shift",
      severity: "low",
      score: 0.2,
      observedAt: new Date().toISOString(),
    },
  ],
});

if (!result.ok || !result.artifact || result.artifact.structuredSuspicion.suspicionClass !== "weak_signal") {
  throw new Error("Expected weak signal suspicion.");
}

console.log("SMOKE_INVESTIGATIVE_INFERENCE_WEAK=PASS");