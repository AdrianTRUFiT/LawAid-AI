import { runProblemLedInquiryIntelligence } from "../src/index.js";

const result = runProblemLedInquiryIntelligence({
  subjectId: "inq_005",
  inquiryText: "",
  partyCount: 1,
  budgetSensitivity: 0.2,
  urgencySensitivity: 0.2,
  qualitySensitivity: 0.2,
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_INQUIRY") {
  throw new Error("Expected invalid inquiry refusal.");
}

console.log("SMOKE_INQUIRY_INVALID=PASS");