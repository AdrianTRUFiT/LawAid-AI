import { runProblemLedInquiryIntelligence } from "../src/index.js";

const result = runProblemLedInquiryIntelligence({
  subjectId: "inq_001",
  inquiryText: "We need to coordinate travel together for a family event.",
  partyCount: 4,
  budgetSensitivity: 0.5,
  urgencySensitivity: 0.4,
  qualitySensitivity: 0.5,
});

if (!result.ok || !result.artifact || result.artifact.problemClass !== "coordination" || result.artifact.poolingCandidate !== true) {
  throw new Error("Expected coordination inquiry.");
}

console.log("SMOKE_INQUIRY_FAMILY_COORDINATION=PASS");