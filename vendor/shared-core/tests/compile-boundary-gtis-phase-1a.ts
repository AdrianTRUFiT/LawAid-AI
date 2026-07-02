import type {
  FinancialMemoryProjection,
  MemoryBoundaryInput
} from "../memory-boundary";
import type {
  ActivatedTransactionStateArtifactGateDecision,
  FundTrackerReverificationRequestInput,
  PaiSafeDisplayBinding
} from "../fundtracker-gtis-integration";

const validProjection: FinancialMemoryProjection = {
  activatedTransactionStateId: "ats_001",
  ledgerSafeSummary: {
    summaryId: "summary_001",
    transactionRef: "txn_phase1a_001",
    merchantContinuityRef: "merchant_001",
    amountBand: "100-250",
    status: "activated",
    narrative: "Ledger-safe summary only."
  },
  merchantContinuityRef: "merchant_001",
  custodyClass: "MEMORY_SAFE",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_001",
  downstreamConsumerPermissions: ["SoulBaseAI"]
};

const validMemoryInput: MemoryBoundaryInput = {
  transactionRef: "txn_phase1a_001",
  sourceSystem: "FundTrackerAI",
  intendedConsumer: "SoulBaseAI",
  projection: validProjection,
  custodyClass: "MEMORY_SAFE",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_001",
  downstreamConsumerPermissions: ["SoulBaseAI"],
  rawFlags: {}
};

void validMemoryInput;

const invalidRawProjection: FinancialMemoryProjection = {
  ledgerSafeSummary: {
    summaryId: "summary_bad",
    transactionRef: "txn_bad",
    status: "verified",
    narrative: "bad"
  },
  // @ts-expect-error RAW_FINANCIAL_SOURCE cannot be assigned to FinancialMemoryProjection custodyClass
  custodyClass: "RAW_FINANCIAL_SOURCE",
  redactionLevel: "SUMMARY_ONLY",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_bad",
  downstreamConsumerPermissions: ["SoulBaseAI"]
};

void invalidRawProjection;

const invalidUnredactedProjection: FinancialMemoryProjection = {
  ledgerSafeSummary: {
    summaryId: "summary_bad_2",
    transactionRef: "txn_bad_2",
    status: "verified",
    narrative: "bad"
  },
  custodyClass: "MEMORY_SAFE",
  // @ts-expect-error NONE redaction cannot be assigned to a permitted FinancialMemoryProjection
  redactionLevel: "NONE",
  retentionRule: "USER_CONTAINER",
  userContainerScope: "user_container_bad",
  downstreamConsumerPermissions: ["SoulBaseAI"]
};

void invalidUnredactedProjection;

const cleanReverificationRequest: FundTrackerReverificationRequestInput = {
  transactionRef: "txn_phase1a_002",
  verifiedOpportunityRef: "verified_opp_002",
  fundTrackerDecisionRef: "ft_decision_002",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  reviewReceiptRef: "review_receipt_002",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: {
    status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY",
    finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
    scopedCompile: "PASS",
    smoke: "PASS",
    launchRequiresHumanAcceptance: true
  },
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: false
};

void cleanReverificationRequest;

// @ts-expect-error GTIS reverification input must expose attemptedWriteToFundTracker boundary flag
const missingWriteBoundaryFlag: FundTrackerReverificationRequestInput = {
  transactionRef: "txn_phase1a_003",
  verifiedOpportunityRef: "verified_opp_003",
  fundTrackerDecisionRef: "ft_decision_003",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: {
    status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY",
    finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
    scopedCompile: "PASS",
    smoke: "PASS",
    launchRequiresHumanAcceptance: true
  },
  humanAcceptanceRecorded: true
};

void missingWriteBoundaryFlag;

// @ts-expect-error PAI-SAFE display binding cannot be treated as ATS gate decision
const displayAsAtsGate: ActivatedTransactionStateArtifactGateDecision = {} as PaiSafeDisplayBinding;

void displayAsAtsGate;
