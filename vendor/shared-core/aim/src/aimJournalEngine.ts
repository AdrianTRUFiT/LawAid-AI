import type { AimDecisionItem } from "./aimDecisionQueueContracts.js";
import type {
  AimDecisionResultClassification,
  AimFeedbackLoopInput,
  AimJournalPacket,
  AimJournalPacketStatus,
  AimReviewOutcomePlaceholder
} from "./aimJournalContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "journal";
}

export function createAimJournalPacketId(decision: AimDecisionItem): string {
  return "aim_journal_" + stableIdPart(decision.decisionId);
}

export function createAimFeedbackId(decision: AimDecisionItem): string {
  return "aim_feedback_" + stableIdPart(decision.decisionId);
}

export function deriveAimJournalPacketStatus(decision: AimDecisionItem): AimJournalPacketStatus {
  if (decision.paiSafeReviewPacket.readyForHumanReview) return "JOURNAL_READY";
  if (decision.paiSafeStatus.startsWith("REFUSED")) return "JOURNAL_ARCHIVED_FOR_REVIEW";
  return "JOURNAL_HELD";
}

export function buildAimReviewOutcomePlaceholder(): AimReviewOutcomePlaceholder {
  return {
    reviewOutcome: "PENDING_HUMAN_REVIEW",
    reviewedAt: "",
    reviewedBy: "",
    humanDecisionNote: "",
    finalAction: ""
  };
}

export function buildAimFeedbackLoopInput(
  decision: AimDecisionItem,
  journalPacketId: string,
  createdAt: string,
  resultClassification: AimDecisionResultClassification = "PENDING_RESULT",
  lessonLearned = "",
  decisionImprovementNote = "",
  contradictionUpdate = "",
  nextReviewPrompt = "Review decision outcome, compare thesis quality, update evidence discipline, and preserve learning without automating action."
): AimFeedbackLoopInput {
  return Object.freeze({
    feedbackId: createAimFeedbackId(decision),
    journalPacketId,
    decisionId: decision.decisionId,
    createdAt,
    priorPaiSafeStatus: decision.paiSafeStatus,
    resultClassification,
    lessonLearned,
    decisionImprovementNote,
    contradictionUpdate,
    nextReviewPrompt,
    humanReviewRequired: true,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    finalAction: ""
  }) as AimFeedbackLoopInput;
}

export function buildAimJournalPacket(
  decision: AimDecisionItem,
  createdAt = "2026-05-14T12:00:00.000Z"
): AimJournalPacket {
  const journalPacketId = createAimJournalPacketId(decision);

  const packet: AimJournalPacket = {
    journalPacketId,
    createdAt,
    status: deriveAimJournalPacketStatus(decision),
    decisionSnapshot: {
      decisionId: decision.decisionId,
      createdAt: decision.createdAt,
      departmentOrigin: decision.departmentOrigin,
      agentOrigin: decision.agentOrigin,
      signalType: decision.signalType,
      assetOrSubject: decision.assetOrSubject,
      thesisReference: decision.thesisReference,
      evidenceStrength: decision.evidenceStrength,
      riskClass: decision.riskClass,
      timingContext: decision.timingContext,
      urgencyLevel: decision.urgencyLevel,
      proposedAction: decision.proposedAction,
      prohibitedActionFlag: decision.prohibitedActionFlag,
      paiSafeStatus: decision.paiSafeStatus,
      humanReviewRequired: true,
      journalRequired: true,
      finalAuthority: "Human"
    },
    rationaleSnapshot: {
      sourceInputs: [...decision.sourceInputs],
      evidenceSummary: decision.evidenceSummary,
      contradictionFlags: [...decision.contradictionFlags],
      readinessReasons: [...decision.paiSafeReviewPacket.reasons],
      nextStep: decision.nextStep
    },
    reviewOutcomePlaceholder: buildAimReviewOutcomePlaceholder(),
    feedbackLoopInput: buildAimFeedbackLoopInput(decision, journalPacketId, createdAt),
    preservationRequired: true,
    humanReviewRequired: true,
    finalAuthority: "Human",
    executionAuthorized: false,
    tradeRecommendation: null,
    financialAdviceProvided: false,
    finalAction: ""
  };

  Object.freeze(packet.decisionSnapshot);
  Object.freeze(packet.rationaleSnapshot.sourceInputs);
  Object.freeze(packet.rationaleSnapshot.contradictionFlags);
  Object.freeze(packet.rationaleSnapshot.readinessReasons);
  Object.freeze(packet.rationaleSnapshot);
  Object.freeze(packet.reviewOutcomePlaceholder);
  return Object.freeze(packet) as AimJournalPacket;
}

export function buildAimJournalPackets(
  decisions: AimDecisionItem[],
  createdAt = "2026-05-14T12:00:00.000Z"
): AimJournalPacket[] {
  return decisions.map((decision) => buildAimJournalPacket(decision, createdAt));
}

export function summarizeAimJournalPackets(packets: AimJournalPacket[]): Record<AimJournalPacketStatus, number> {
  const summary: Record<AimJournalPacketStatus, number> = {
    JOURNAL_READY: 0,
    JOURNAL_HELD: 0,
    JOURNAL_REFUSED_INPUT: 0,
    JOURNAL_ARCHIVED_FOR_REVIEW: 0
  };

  for (const packet of packets) {
    summary[packet.status] += 1;
  }

  return summary;
}