import type { FraudPressureDecision } from "../adaptive-fraud-pressure-matrix";
import type { PaiSafeSurfaceState } from "../pai-safe-surface";
import type {
  EscalationEvidencePacket,
  HumanReviewDecision,
  HumanReviewerAuthority,
  HumanReviewQueueDecision,
  HumanReviewQueueItem,
  HumanReviewResolutionDecision,
  HumanReviewResolutionRequest,
  ReviewDecisionReceipt,
  ReviewQueueRefusalCode
} from "./humanReviewQueueContracts";

function nowIso(): string {
  return new Date().toISOString();
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function requiresHumanReview(decision: FraudPressureDecision): boolean {
  return (
    decision.reviewRequired === true ||
    decision.route === "HUMAN_REVIEW" ||
    decision.route === "CRITICAL_ESCALATION"
  );
}

export function buildEscalationEvidencePacket(
  fraudPressureDecision: FraudPressureDecision,
  paiSafeSurfaceState: PaiSafeSurfaceState
): EscalationEvidencePacket {
  return {
    evidencePacketId: `evidence_${fraudPressureDecision.observationId}`,
    observationId: fraudPressureDecision.observationId,
    vector: fraudPressureDecision.vector,
    severity: fraudPressureDecision.severity,
    route: fraudPressureDecision.route,
    riskScore: fraudPressureDecision.score.aggregateScore,
    paiSafeId: paiSafeSurfaceState.paiSafeId,
    paiSafeStatus: paiSafeSurfaceState.status,
    transactionRef: paiSafeSurfaceState.transactionRef,
    fundTrackerDecisionRef: paiSafeSurfaceState.fundTrackerDecisionRef,
    ...(paiSafeSurfaceState.activatedTransactionStateRef
      ? { activatedTransactionStateRef: paiSafeSurfaceState.activatedTransactionStateRef }
      : {}),
    evidenceSummary:
      "Machine refusal bridged into human custody with FundTrackerAI references preserved. This packet is evidence only and creates no consequence.",
    machineRefused: true,
    humanAuthorizationRequiredForConsequence: true,
    createdAt: nowIso(),
    boundary: {
      evidencePacketIsNotPaymentAuthority: true,
      evidencePacketIsNotTransactionTruth: true,
      evidencePacketIsNotCustodyTransfer: true,
      evidencePacketIsNotRuntimeActivation: true,
      evidencePacketRequiresHumanReview: true
    }
  };
}

export function queueHumanReviewItem(
  fraudPressureDecision: FraudPressureDecision | undefined,
  paiSafeSurfaceState: PaiSafeSurfaceState | undefined
): HumanReviewQueueDecision {
  const refusalReasons: ReviewQueueRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (!fraudPressureDecision) {
    refusalReasons.push("FRAUD_PRESSURE_DECISION_REQUIRED");
    requiredCorrections.push("Provide FraudPressureDecision.");
  }

  if (!paiSafeSurfaceState) {
    refusalReasons.push("PAI_SAFE_SURFACE_REQUIRED");
    requiredCorrections.push("Provide PAI-SAFE surface state.");
  }

  if (fraudPressureDecision && fraudPressureDecision.machineRefused !== true) {
    refusalReasons.push("MACHINE_REFUSAL_REQUIRED");
    requiredCorrections.push("Machine refusal must occur before human review queue.");
  }

  if (fraudPressureDecision && !requiresHumanReview(fraudPressureDecision)) {
    refusalReasons.push("HUMAN_REVIEW_ROUTE_REQUIRED");
    requiredCorrections.push("Only HUMAN_REVIEW or CRITICAL_ESCALATION routes enter this queue.");
  }

  if (refusalReasons.length > 0 || !fraudPressureDecision || !paiSafeSurfaceState) {
    return {
      status: "REVIEW_ITEM_REFUSED",
      queued: false,
      refusalReasons: Array.from(new Set(refusalReasons)),
      requiredCorrections: Array.from(new Set(requiredCorrections)),
      boundary: {
        machineCanRefuse: true,
        machineCannotAuthorizeConsequence: true,
        humanReviewRequiredForConsequence: true,
        noPaymentAuthorityCreated: true,
        noTransactionTruthCreated: true,
        noCustodyTransferCreated: true,
        noRuntimeActivationCreated: true
      }
    };
  }

  const evidencePacket = buildEscalationEvidencePacket(fraudPressureDecision, paiSafeSurfaceState);

  const item: HumanReviewQueueItem = {
    reviewItemId: `review_${fraudPressureDecision.observationId}`,
    status: "REVIEW_ITEM_QUEUED",
    evidencePacket,
    fraudPressureDecision,
    paiSafeSurfaceState,
    queuedAt: nowIso(),
    boundary: {
      queueIsNotPaymentAuthority: true,
      queueIsNotTransactionTruth: true,
      queueIsNotCustodyTransfer: true,
      queueIsNotRuntimeActivation: true,
      machineRefusalBridgedToHumanCustody: true
    }
  };

  return {
    status: "REVIEW_ITEM_QUEUED",
    queued: true,
    item,
    refusalReasons: [],
    requiredCorrections: [],
    boundary: {
      machineCanRefuse: true,
      machineCannotAuthorizeConsequence: true,
      humanReviewRequiredForConsequence: true,
      noPaymentAuthorityCreated: true,
      noTransactionTruthCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true
    }
  };
}

function nextAllowedTargetForDecision(decision: HumanReviewDecision): ReviewDecisionReceipt["nextAllowedTarget"] {
  if (decision === "AUTHORIZE_RELEASE_TO_FUNDTRACKER") return "FUNDTRACKER_REVIEW_HANDOFF";
  if (decision === "CONTINUE_HOLD") return "CONTINUE_HOLD";
  if (decision === "ESCALATE_TO_SECURITY") return "SECURITY_ESCALATION";
  if (decision === "ESCALATE_TO_OPERATOR") return "OPERATOR_ESCALATION";
  return "NONE";
}

function reviewerIsAuthorized(authority: HumanReviewerAuthority): boolean {
  return authority === "AUTHORIZED_OPERATOR" || authority === "AUTHORIZED_SECURITY_REVIEWER";
}

export function resolveHumanReview(
  request: HumanReviewResolutionRequest
): HumanReviewResolutionDecision {
  const refusalReasons: ReviewQueueRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (!request.reviewItem || request.reviewItem.status !== "REVIEW_ITEM_QUEUED") {
    refusalReasons.push("EVIDENCE_PACKET_MISSING");
    requiredCorrections.push("Provide a queued review item with evidence packet.");
  }

  if (!reviewerIsAuthorized(request.reviewerAuthority)) {
    refusalReasons.push("REVIEWER_NOT_AUTHORIZED");
    requiredCorrections.push("Resolution requires authorized operator or authorized security reviewer.");
  }

  if (!hasText(request.reviewerId)) {
    refusalReasons.push("REVIEWER_NOT_AUTHORIZED");
    requiredCorrections.push("Provide reviewerId.");
  }

  if (!request.decision) {
    refusalReasons.push("RESOLUTION_DECISION_MISSING");
    requiredCorrections.push("Provide review decision.");
  }

  if (request.decision === "AUTHORIZE_RELEASE_TO_FUNDTRACKER") {
    requiredCorrections.push("Release is handoff only: FundTrackerAI must still authorize consequence.");
  }

  if (refusalReasons.length > 0) {
    return {
      status: "RESOLUTION_REFUSED",
      accepted: false,
      refusalReasons: Array.from(new Set(refusalReasons)),
      requiredCorrections: Array.from(new Set(requiredCorrections)),
      boundary: {
        authorizedHumanReviewRequired: true,
        releaseDoesNotBypassFundTrackerAI: true,
        resolutionDoesNotCreatePaymentAuthority: true,
        resolutionDoesNotCreateTransactionTruth: true,
        resolutionDoesNotCreateCustodyTransfer: true,
        resolutionDoesNotCreateRuntimeActivation: true
      }
    };
  }

  const receipt: ReviewDecisionReceipt = {
    receiptId: `review_receipt_${request.reviewItem.reviewItemId}`,
    reviewItemId: request.reviewItem.reviewItemId,
    reviewerId: request.reviewerId,
    reviewerAuthority: request.reviewerAuthority,
    decision: request.decision,
    resolutionNotes: request.resolutionNotes,
    resolvedAt: request.resolvedAt,
    nextAllowedTarget: nextAllowedTargetForDecision(request.decision),
    boundary: {
      receiptIsNotPaymentAuthority: true,
      receiptIsNotTransactionTruth: true,
      receiptIsNotCustodyTransfer: true,
      receiptIsNotRuntimeActivation: true,
      fundTrackerMustStillAuthorizeConsequence: true,
      paiSafeRemainsDisplayOnly: true,
      finTechionAIRemainsOversightOnly: true
    }
  };

  return {
    status: "RESOLUTION_ACCEPTED",
    accepted: true,
    receipt,
    refusalReasons: [],
    requiredCorrections:
      request.decision === "AUTHORIZE_RELEASE_TO_FUNDTRACKER"
        ? ["FundTrackerAI review handoff required before consequence."]
        : [],
    boundary: {
      authorizedHumanReviewRequired: true,
      releaseDoesNotBypassFundTrackerAI: true,
      resolutionDoesNotCreatePaymentAuthority: true,
      resolutionDoesNotCreateTransactionTruth: true,
      resolutionDoesNotCreateCustodyTransfer: true,
      resolutionDoesNotCreateRuntimeActivation: true
    }
  };
}
