import type {
  ProblemLedInquiryArtifact,
  ProblemLedInquiryInput,
  ProblemLedInquiryResult,
} from "./problemLedInquiryTypes.js";
import {
  inferDecision,
  inferProblemClass,
  makeInquiryIntelligenceId,
  nowIso,
} from "./problemLedInquiryUtils.js";

export function runProblemLedInquiryIntelligence(
  input: ProblemLedInquiryInput,
): ProblemLedInquiryResult {
  if (!input.inquiryText || input.inquiryText.trim().length < 3) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_INQUIRY",
        refusalReason: "Problem-led inquiry intelligence refused because inquiry text is too weak.",
      },
    };
  }

  const scores = [
    input.budgetSensitivity,
    input.urgencySensitivity,
    input.qualitySensitivity,
  ];

  if (scores.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Problem-led inquiry intelligence refused because one or more sensitivity scores are invalid.",
      },
    };
  }

  const problemClass = inferProblemClass(
    input.inquiryText,
    input.budgetSensitivity,
    input.urgencySensitivity,
    input.qualitySensitivity,
    input.partyCount,
  );

  const whyScore = Math.max(
    input.budgetSensitivity,
    input.urgencySensitivity,
    input.qualitySensitivity,
    input.partyCount >= 3 ? 0.8 : 0.2,
  );

  const movementScore =
    (input.budgetSensitivity * 0.3) +
    (input.urgencySensitivity * 0.35) +
    (input.qualitySensitivity * 0.35);

  const governingDecision = inferDecision(problemClass, whyScore);

  const poolingCandidate =
    problemClass === "coordination" ||
    (problemClass === "cost_control" && input.partyCount >= 2);

  const artifact: ProblemLedInquiryArtifact = {
    inquiryIntelligenceId: makeInquiryIntelligenceId(input.subjectId),
    subjectId: input.subjectId,
    problemClass,
    governingDecision,
    whyScore,
    movementScore,
    poolingCandidate,
    reason: "Inquiry interpreted into a governed problem-led pre-booking state.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}