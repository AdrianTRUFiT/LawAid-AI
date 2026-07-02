import { runProblemLedInquiryIntelligence } from "../src/index.js";

const result = runProblemLedInquiryIntelligence({
  subjectId: "inq_004",
  inquiryText: "Need options.",
  partyCount: 1,
  budgetSensitivity: 0.3,
  urgencySensitivity: 0.3,
  qualitySensitivity: 0.3,
});

if (!result.ok || !result.artifact || result.artifact.governingDecision !== "HOLD") {
  throw new Error("Expected weak inquiry hold.");
}

console.log("SMOKE_INQUIRY_WEAK_HOLD=PASS");