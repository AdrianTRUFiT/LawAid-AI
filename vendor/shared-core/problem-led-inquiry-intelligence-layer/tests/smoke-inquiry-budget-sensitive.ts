import { runProblemLedInquiryIntelligence } from "../src/index.js";

const result = runProblemLedInquiryIntelligence({
  subjectId: "inq_002",
  inquiryText: "Find the most affordable option for this route.",
  partyCount: 1,
  budgetSensitivity: 0.9,
  urgencySensitivity: 0.2,
  qualitySensitivity: 0.4,
});

if (!result.ok || !result.artifact || result.artifact.problemClass !== "cost_control" || result.artifact.governingDecision !== "COMPARE") {
  throw new Error("Expected cost-control inquiry.");
}

console.log("SMOKE_INQUIRY_BUDGET_SENSITIVE=PASS");