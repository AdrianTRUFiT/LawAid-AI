import type {
  AimDecisionItem,
  AimPaiSafeDecisionReviewStatus,
  AimPaiSafeReviewPacket,
  AimStructuredDecisionInput
} from "./aimDecisionQueueContracts.js";

const PROHIBITED_ACTION_PHRASES = [
  "buy now",
  "sell now",
  "execute trade",
  "execute order",
  "place trade",
  "open position",
  "close position",
  "trade approved",
  "investment approved",
  "guaranteed profit",
  "sure winner",
  "automatic trade"
];

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "decision";
}

export function createAimDecisionId(input: AimStructuredDecisionInput): string {
  return "aim_decision_" + stableIdPart(input.assetOrSubject) + "_" + stableIdPart(input.signalType);
}

export function containsProhibitedActionLanguage(value: string): boolean {
  const normalized = value.toLowerCase();
  return PROHIBITED_ACTION_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function hasDecisionDocumentation(input: AimStructuredDecisionInput): boolean {
  return (
    input.sourceInputs.length > 0 &&
    input.documentationRefs.length > 0 &&
    input.thesisReference.trim().length > 0 &&
    input.evidenceSummary.trim().length > 0 &&
    input.proposedAction.trim().length > 0
  );
}

export function evaluatePaiSafeDecisionReadiness(
  decisionId: string,
  input: AimStructuredDecisionInput
): AimPaiSafeReviewPacket {
  const reasons: string[] = [];
  const prohibitedAction = containsProhibitedActionLanguage(input.proposedAction);

  if (prohibitedAction || !hasDecisionDocumentation(input)) {
    if (prohibitedAction) {
      reasons.push("Proposed action contains prohibited trade, execution, certainty, or approval language.");
    }

    if (!hasDecisionDocumentation(input)) {
      reasons.push("Decision item is missing source input, documentation reference, thesis reference, evidence summary, or proposed action.");
    }

    return {
      decisionId,
      status: "REFUSED — UNDOCUMENTED ACTION",
      reasons,
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.contradictionFlags.length > 0 || input.evidenceStrength === "Contradicted") {
    return {
      decisionId,
      status: "REFUSED — THESIS CONTRADICTION",
      reasons: ["Decision item contains contradiction flags or contradicted evidence."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.riskClass === "Excessive") {
    return {
      decisionId,
      status: "REFUSED — RISK TOO HIGH",
      reasons: ["Risk class is excessive for readiness review."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.evidenceStrength === "Weak" || input.evidenceStrength === "Insufficient" || input.sourceInputs.length < 2) {
    return {
      decisionId,
      status: "REFUSED — INSUFFICIENT SIGNAL",
      reasons: ["Evidence strength or source count is insufficient for review readiness."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  if (input.evidenceStrength === "Moderate" || input.timingContext === "Unknown") {
    return {
      decisionId,
      status: "HOLD FOR CONFIRMATION",
      reasons: ["Decision item requires confirmation before human review readiness."],
      readyForHumanReview: false,
      mayApproveInvestment: false,
      mayExecuteTrade: false,
      mayProvideFinancialAdvice: false,
      humanAuthorityRequired: true
    };
  }

  return {
    decisionId,
    status: "SAFE TO REVIEW",
    reasons: ["Decision item is documented, non-contradicted, bounded, and ready for human review."],
    readyForHumanReview: true,
    mayApproveInvestment: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    humanAuthorityRequired: true
  };
}

export function buildAimDecisionItem(
  input: AimStructuredDecisionInput,
  createdAt = "2026-05-14T00:00:00.000Z"
): AimDecisionItem {
  const decisionId = createAimDecisionId(input);
  const prohibitedActionFlag = containsProhibitedActionLanguage(input.proposedAction);
  const paiSafeReviewPacket = evaluatePaiSafeDecisionReadiness(decisionId, input);

  const nextStep =
    input.nextStep?.trim() ||
    (paiSafeReviewPacket.status === "SAFE TO REVIEW"
      ? "Present to human authority for review. Preserve journal before any final action."
      : "Hold or refuse. Resolve readiness issue before human review.");

  return {
    decisionId,
    createdAt,
    sourceInputs: [...input.sourceInputs],
    departmentOrigin: input.departmentOrigin,
    agentOrigin: input.agentOrigin,
    signalType: input.signalType,
    assetOrSubject: input.assetOrSubject,
    thesisReference: input.thesisReference,
    evidenceSummary: input.evidenceSummary,
    evidenceStrength: input.evidenceStrength,
    contradictionFlags: [...input.contradictionFlags],
    riskClass: input.riskClass,
    timingContext: input.timingContext,
    urgencyLevel: input.urgencyLevel,
    proposedAction: input.proposedAction,
    prohibitedActionFlag,
    paiSafeStatus: paiSafeReviewPacket.status,
    humanReviewRequired: true,
    journalRequired: true,
    finalAuthority: "Human",
    nextStep,
    paiSafeReviewPacket
  };
}

export function buildAimDecisionQueue(inputs: AimStructuredDecisionInput[]): AimDecisionItem[] {
  return inputs.map((input) => buildAimDecisionItem(input));
}

export function summarizeAimDecisionQueue(queue: AimDecisionItem[]): Record<AimPaiSafeDecisionReviewStatus, number> {
  return queue.reduce(
    (summary, item) => {
      summary[item.paiSafeStatus] += 1;
      return summary;
    },
    {
      "SAFE TO REVIEW": 0,
      "HOLD FOR CONFIRMATION": 0,
      "REFUSED — INSUFFICIENT SIGNAL": 0,
      "REFUSED — THESIS CONTRADICTION": 0,
      "REFUSED — RISK TOO HIGH": 0,
      "REFUSED — UNDOCUMENTED ACTION": 0
    } satisfies Record<AimPaiSafeDecisionReviewStatus, number>
  );
}