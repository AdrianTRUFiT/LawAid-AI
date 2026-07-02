import { runInvestigativeInference } from "../src/index.js";

const result = runInvestigativeInference({
  subjectId: "asset_004",
  anomalies: [],
});

if (result.ok || result.refusal?.refusalCode !== "NO_ANOMALIES") {
  throw new Error("Expected no-anomalies refusal.");
}

console.log("SMOKE_INVESTIGATIVE_INFERENCE_NO_ANOMALIES=PASS");