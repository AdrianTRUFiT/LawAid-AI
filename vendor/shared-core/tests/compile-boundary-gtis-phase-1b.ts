import type {
  PaiSafeDisplayState,
  TransactionAuthorityState
} from "../gtis-paisafe-display-binding";

import type {
  FinTechionOversightFeed,
  OperatorCommandState,
  IncomingFinTechionOversightSignal,
  FinTechionOversightSignal
} from "../fintechionai-oversight-feed";

import type {
  ClaimToArtifact
} from "../gtis-demo-harness";

const displayState: PaiSafeDisplayState = {
  __brand: "PAI_SAFE_DISPLAY_STATE",
  bindingId: "display_001",
  transactionRef: "txn_001",
  status: "display_governed_safe",
  consumerMessage: "Display only.",
  safeToDisplay: true,
  safeToProceed: true,
  downstreamActivationEligible: false,
  proofReference: "proof_001",
  sourceRefs: {
    fundTrackerDecisionRef: "ft_001",
    governedStateSource: "FUNDTRACKER_REVERIFICATION_REQUEST"
  },
  prohibitedExposure: {
    rawProcessorObjectExposed: false,
    internalScoringWeightsExposed: false,
    custodyClassDetailsExposed: false,
    auditInternalsExposed: false
  },
  refusalReasons: [],
  boundary: {
    paiSafeIsDisplayOnly: true,
    displayIsNotAuthority: true,
    displayCannotBecomeTransactionTruth: true,
    paiSafeDoesNotCreatePaymentAuthority: true,
    paiSafeDoesNotCreateRuntimeActivation: true,
    fundTrackerAIRemainsTransactionTruth: true
  }
};

void displayState;

// @ts-expect-error PAI-SAFE display state cannot be assigned to transaction authority state
const displayAsAuthority: TransactionAuthorityState = displayState;

void displayAsAuthority;

const oversightFeed: FinTechionOversightFeed = {
  __brand: "FINTECHIONAI_READ_ONLY_OVERSIGHT_FEED",
  feedId: "feed_001",
  transactionRef: "txn_001",
  route: "monitor",
  signals: [],
  operatorSummary: "Read only.",
  boundary: {
    oversightIsReadOnly: true,
    oversightIsNotTransactionTruth: true,
    oversightDoesNotOverrideFundTrackerAI: true,
    oversightDoesNotCreateActivatedTransactionState: true,
    oversightDoesNotAuthorizeConsequence: true,
    noConsumerPIICrossesFeed: true,
    noRawFinancialSourceCrossesFeed: true,
    noWritePathBackToGTISOrFundTrackerAI: true
  }
};

void oversightFeed;

// @ts-expect-error FinTechionAI read-only oversight feed cannot be assigned to command authority
const feedAsCommand: OperatorCommandState = oversightFeed;

void feedAsCommand;

// @ts-expect-error Oversight feed has no write-back function
oversightFeed.writeBackToFundTrackerAI("txn_001");

const dirtyIncomingSignal: IncomingFinTechionOversightSignal = {
  signalId: "dirty_compile_signal",
  transactionRef: "txn_compile_dirty",
  signalClass: "AUDIT_SPINE",
  severity: "CRITICAL",
  summary: "Incoming dirty signal allowed only before filtering.",
  sourceRef: "dirty_source",
  containsConsumerPII: false,
  containsRawFinancialSource: true
};

void dirtyIncomingSignal;

const dirtyEmittedSignal: FinTechionOversightSignal = {
  signalId: "dirty_emitted_signal",
  transactionRef: "txn_compile_dirty",
  signalClass: "AUDIT_SPINE",
  severity: "CRITICAL",
  summary: "Dirty emitted signal must fail.",
  sourceRef: "dirty_source",
  containsConsumerPII: false,
  // @ts-expect-error Emitted oversight signal must never contain raw financial source.
  containsRawFinancialSource: true
};

void dirtyEmittedSignal;

const supportedClaim: ClaimToArtifact = {
  claimId: "claim_001",
  claim: "PAI-SAFE remains display only.",
  artifactRefs: ["artifact_001"],
  allowedForExternalDemo: true,
  boundary: {
    claimRequiresArtifactSupport: true,
    claimMustNotExceedVerifiedBuild: true,
    claimCreatesNoAuthority: true
  }
};

void supportedClaim;
