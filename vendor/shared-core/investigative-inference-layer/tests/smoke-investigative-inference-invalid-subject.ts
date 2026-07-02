import { runInvestigativeInference } from "../src/index.js";

const result = runInvestigativeInference({
  subjectId: "",
  anomalies: [
    {
      anomalyId: "an_005",
      subjectId: "",
      sourceId: "source_a",
      category: "missing_subject",
      severity: "moderate",
      score: 0.4,
      observedAt: new Date().toISOString(),
    },
  ],
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_SUBJECT") {
  throw new Error("Expected invalid-subject refusal.");
}

console.log("SMOKE_INVESTIGATIVE_INFERENCE_INVALID_SUBJECT=PASS");