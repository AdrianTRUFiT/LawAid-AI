import { runProblemLedInquiryIntelligence } from "../src/index.js";

const result = runProblemLedInquiryIntelligence({
  subjectId: "inq_003",
  inquiryText: "I need something today as soon as possible.",
  partyCount: 1,
  budgetSensitivity: 0.3,
  urgencySensitivity: 0.95,
  qualitySensitivity: 0.3,
});

if (!result.ok || !result.artifact || result.artifact.problemClass !== "urgency" || result.artifact.governingDecision !== "ADVANCE") {
  throw new Error("Expected urgency inquiry.");
}

console.log("SMOKE_INQUIRY_URGENCY=PASS");