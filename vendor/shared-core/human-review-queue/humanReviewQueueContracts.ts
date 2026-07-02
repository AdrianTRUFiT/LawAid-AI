import type {
  FraudPressureDecision,
  FraudPressureRoute,
  FraudSeverityTier
} from "../adaptive-fraud-pressure-matrix";
import type { PaiSafeSurfaceState } from "../pai-safe-surface";

export type HumanReviewQueueStatus =
  | "REVIEW_ITEM_QUEUED"
  | "REVIEW_ITEM_REFUSED";

export type HumanReviewResolutionStatus =
  | "RESOLUTION_ACCEPTED"
  | "RESOLUTION_REFUSED";

export type HumanReviewDecision =
  | "UPHOLD_MACHINE_REFUSAL"
  | "CONTINUE_HOLD"
  | "AUTHORIZE_RELEASE_TO_FUNDTRACKER"
  | "ESCALATE_TO_SECURITY"
  | "ESCALATE_TO_OPERATOR";

export type HumanReviewerAuthority =
  | "AUTHORIZED_OPERATOR"
  | "AUTHORIZED_SECURITY_REVIEWER"
  | "UNAUTHORIZED";

export type ReviewQueueRefusalCode =
  | "FRAUD_PRESSURE_DECISION_REQUIRED"
  | "PAI_SAFE_SURFACE_REQUIRED"
  | "MACHINE_REFUSAL_REQUIRED"
  | "HUMAN_REVIEW_ROUTE_REQUIRED"
  | "EVIDENCE_PACKET_MISSING"
  | "REVIEWER_NOT_AUTHORIZED"
  | "RESOLUTION_DECISION_MISSING"
  | "RELEASE_REQUIRES_FUNDTRACKER_HANDOFF"
  | "PAI_SAFE_CANNOT_AUTHORIZE_RELEASE"
  | "FINTECHIONAI_CANNOT_AUTHORIZE_RELEASE"
  | "MACHINE_CANNOT_AUTHORIZE_CONSEQUENCE"
  | "ACTIVATION_NOT_CREATED_HERE";

export interface EscalationEvidencePacket {
  evidencePacketId: string;
  observationId: string;
  vector: string;
  severity: FraudSeverityTier;
  route: FraudPressureRoute;
  riskScore: number;
  paiSafeId: string;
  paiSafeStatus: string;
  transactionRef: string;
  fundTrackerDecisionRef: string;
  activatedTransactionStateRef?: string;
  evidenceSummary: string;
  machineRefused: true;
  humanAuthorizationRequiredForConsequence: true;
  createdAt: string;
  boundary: {
    evidencePacketIsNotPaymentAuthority: true;
    evidencePacketIsNotTransactionTruth: true;
    evidencePacketIsNotCustodyTransfer: true;
    evidencePacketIsNotRuntimeActivation: true;
    evidencePacketRequiresHumanReview: true;
  };
}

export interface HumanReviewQueueItem {
  reviewItemId: string;
  status: HumanReviewQueueStatus;
  evidencePacket: EscalationEvidencePacket;
  fraudPressureDecision: FraudPressureDecision;
  paiSafeSurfaceState: PaiSafeSurfaceState;
  queuedAt: string;
  boundary: {
    queueIsNotPaymentAuthority: true;
    queueIsNotTransactionTruth: true;
    queueIsNotCustodyTransfer: true;
    queueIsNotRuntimeActivation: true;
    machineRefusalBridgedToHumanCustody: true;
  };
}

export interface HumanReviewQueueDecision {
  status: HumanReviewQueueStatus;
  queued: boolean;
  item?: HumanReviewQueueItem;
  refusalReasons: ReviewQueueRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    machineCanRefuse: true;
    machineCannotAuthorizeConsequence: true;
    humanReviewRequiredForConsequence: true;
    noPaymentAuthorityCreated: true;
    noTransactionTruthCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
  };
}

export interface HumanReviewResolutionRequest {
  reviewItem: HumanReviewQueueItem;
  reviewerId: string;
  reviewerAuthority: HumanReviewerAuthority;
  decision: HumanReviewDecision;
  resolutionNotes: string;
  resolvedAt: string;
}

export interface ReviewDecisionReceipt {
  receiptId: string;
  reviewItemId: string;
  reviewerId: string;
  reviewerAuthority: HumanReviewerAuthority;
  decision: HumanReviewDecision;
  resolutionNotes: string;
  resolvedAt: string;
  nextAllowedTarget:
    | "FUNDTRACKER_REVIEW_HANDOFF"
    | "CONTINUE_HOLD"
    | "SECURITY_ESCALATION"
    | "OPERATOR_ESCALATION"
    | "NONE";
  boundary: {
    receiptIsNotPaymentAuthority: true;
    receiptIsNotTransactionTruth: true;
    receiptIsNotCustodyTransfer: true;
    receiptIsNotRuntimeActivation: true;
    fundTrackerMustStillAuthorizeConsequence: true;
    paiSafeRemainsDisplayOnly: true;
    finTechionAIRemainsOversightOnly: true;
  };
}

export interface HumanReviewResolutionDecision {
  status: HumanReviewResolutionStatus;
  accepted: boolean;
  receipt?: ReviewDecisionReceipt;
  refusalReasons: ReviewQueueRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    authorizedHumanReviewRequired: true;
    releaseDoesNotBypassFundTrackerAI: true;
    resolutionDoesNotCreatePaymentAuthority: true;
    resolutionDoesNotCreateTransactionTruth: true;
    resolutionDoesNotCreateCustodyTransfer: true;
    resolutionDoesNotCreateRuntimeActivation: true;
  };
}
