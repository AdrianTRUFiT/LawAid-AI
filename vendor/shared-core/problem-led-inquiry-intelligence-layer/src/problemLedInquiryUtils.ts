import type { InquiryDecision, InquiryProblemClass } from "./problemLedInquiryTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeInquiryIntelligenceId(subjectId: string): string {
  return `inquiry_intel_${subjectId}`;
}

export function inferProblemClass(
  inquiryText: string,
  budgetSensitivity: number,
  urgencySensitivity: number,
  qualitySensitivity: number,
  partyCount: number,
): InquiryProblemClass {
  const text = inquiryText.toLowerCase();

  if (partyCount >= 3 || text.includes("group") || text.includes("together") || text.includes("coordinate")) {
    return "coordination";
  }

  if (budgetSensitivity >= 0.75 || text.includes("cheap") || text.includes("budget") || text.includes("affordable")) {
    return "cost_control";
  }

  if (urgencySensitivity >= 0.75 || text.includes("urgent") || text.includes("asap") || text.includes("today")) {
    return "urgency";
  }

  if (qualitySensitivity >= 0.75 || text.includes("quality") || text.includes("best") || text.includes("reliable")) {
    return "quality";
  }

  return "unknown";
}

export function inferDecision(problemClass: InquiryProblemClass, whyScore: number): InquiryDecision {
  if (whyScore < 0.25) {
    return "REFUSE";
  }

  if (problemClass === "unknown") {
    return "HOLD";
  }

  if (problemClass === "cost_control" || problemClass === "quality") {
    return "COMPARE";
  }

  return "ADVANCE";
}