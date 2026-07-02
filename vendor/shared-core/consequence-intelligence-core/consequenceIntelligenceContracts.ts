import type { FraudPressureDecision } from "../adaptive-fraud-pressure-matrix";
import type { PaiSafeSurfaceState } from "../pai-safe-surface";
import type { ReviewDecisionReceipt } from "../human-review-queue";

export type ConsequenceRoute =
  | "INSTANT_REFUSE"
  | "CONTINUE_HOLD"
  | "HUMAN_REVIEW_REQUIRED"
  | "FUNDTRACKER_REVERIFY_HANDOFF"
  | "ACTIVATION_ELIGIBILITY_READY";

export type ConsequenceStatus =
  | "CONSEQUENCE_INTELLIGENCE_REFUSED"
  | "CONSEQUENCE_INTELLIGENCE_HELD"
  | "CONSEQUENCE_INTELLIGENCE_HANDOFF_READY"
  | "CONSEQUENCE_INTELLIGENCE_ACTIVATION_ELIGIBLE";

export type ConsequenceRefusalCode =
  | "FUNDTRACKER_REVIEW_RECEIPT_REQUIRED"
  | "AUTHORIZED_REVIEW_RECEIPT_REQUIRED"
  | "PAI_SAFE_CANNOT_AUTHORIZE_CONSEQUENCE"
  | "FUNDTRACKER_REFERENCE_REQUIRED"
  | "ACTIVATED_TRANSACTION_STATE_REQUIRED"
  | "FRESH_FRAUD_PRESSURE_RECHECK_REQUIRED"
  | "CRITICAL_FRAUD_PRESSURE_ACTIVE"
  | "LEDGER_CHAIN_NOT_VERIFIED"
  | "REGISTRY_RECEIPT_NOT_VERIFIED"
  | "REPLAY_PRESSURE_ACTIVE"
  | "TIME_WINDOW_EXPIRED"
  | "DRIFT_SIGNAL_ACTIVE"
  | "SYNTHETIC_AUTHORITY_ATTEMPT_REFUSED";

export interface ConsequenceProofHealth {
  ledgerChainVerified: boolean;
  registryReceiptVerified: boolean;
  fileLedgerVerified: boolean;
  fraudResistanceReportFresh: boolean;
  publicPrivateSeparationVerified: boolean;
}

export interface ConsequenceTimingWindow {
  evaluatedAt: string;
  sourceEventAt: string;
  maxAllowedSkewMs: number;
  actualSkewMs: number;
  verificationWindowId: string;
}

export interface ConsequenceDriftSignal {
  signalId: string;
  label: string;
  active: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface ConsequenceIntelligenceInput {
  transactionRef: string;
  fundTrackerDecisionRef: string;
  activatedTransactionStateRef?: string;
  paiSafeSurfaceState: PaiSafeSurfaceState;
  fraudPressureDecision: FraudPressureDecision;
  reviewReceipt?: ReviewDecisionReceipt;
  proofHealth: ConsequenceProofHealth;
  timingWindow: ConsequenceTimingWindow;
  replayPressureCount: number;
  driftSignals: ConsequenceDriftSignal[];
  syntheticAuthorityClaimed: boolean;
}

export interface ConsequenceScoreBreakdown {
  proofIntegrityScore: number;
  authorityIntegrityScore: number;
  fraudPressureScore: number;
  timeFreshnessScore: number;
  driftResistanceScore: number;
  replayResistanceScore: number;
  aggregateScore: number;
}

export interface MovingTargetChallenge {
  challengeId: string;
  transactionRef: string;
  verificationWindowId: string;
  challengeHash: string;
  derivedFrom: {
    transactionRef: string;
    fundTrackerDecisionRef: string;
    paiSafeId: string;
    fraudObservationId: string;
    reviewReceiptId: string;
    verificationWindowId: string;
  };
  boundary: {
    challengeIsNotPaymentAuthority: true;
    challengeIsNotTransactionTruth: true;
    challengeIsNotCustodyTransfer: true;
    challengeIsNotRuntimeActivation: true;
    movingTargetPreventsStaticReplay: true;
  };
}

export interface ConsequenceIntelligenceDecision {
  status: ConsequenceStatus;
  route: ConsequenceRoute;
  confidenceScore: ConsequenceScoreBreakdown;
  challenge: MovingTargetChallenge;
  refusalReasons: ConsequenceRefusalCode[];
  requiredCorrections: string[];
  consequenceEligible: boolean;
  fundTrackerReverificationRequired: boolean;
  activationEligibilityPrecheckPassed: boolean;
  boundary: {
    decisionIsNotPaymentAuthority: true;
    decisionIsNotTransactionTruth: true;
    decisionIsNotCustodyTransfer: true;
    decisionIsNotRuntimeActivation: true;
    paiSafeRemainsDisplayOnly: true;
    humanReceiptIsNotActivation: true;
    fundTrackerMustStillAuthorizeConsequence: true;
    machineCanRefuseButCannotAuthorizeConsequence: true;
  };
}
