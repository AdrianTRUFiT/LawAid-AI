import type {
  FinTechionCommandAuthority,
  GTISWriteAuthority,
  LiveActivatedTransactionState,
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  PaiSafeAuthority,
  SandboxActivatedTransactionState,
  SandboxTransactionRecord
} from "../fundtrackerai-sandbox-transaction-authority";

const record: SandboxTransactionRecord = {
  __brand: "FUNDTRACKERAI_SANDBOX_TRANSACTION_RECORD",
  transactionRef: "compile_txn",
  status: "SANDBOX_TRANSACTION_VERIFIED",
  verifiedOpportunityRef: "sandbox_verified_opportunity_compile_txn",
  processorEventRef: "sandbox_processor_event_compile_txn",
  fundTrackerDecisionRef: "ft_sandbox_decision_compile_txn",
  replayNonces: ["nonce_compile_txn"],
  refusalCodes: [],
  history: [],
  boundary: {
    sandboxOnly: true,
    fundTrackerAIIsTruthAuthority: true,
    processorEventIsNotAuthority: true,
    gtisHasNoWriteAuthority: true,
    paiSafeHasNoAuthority: true,
    fintechionAIHasNoCommandAuthority: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveATSCreated: true
  }
};

void record;

// @ts-expect-error Sandbox record cannot become live rail authority.
const asLiveRailAuthority: LiveRailAuthority = record;

void asLiveRailAuthority;

// @ts-expect-error Sandbox record cannot become live payment processing authority.
const asLivePaymentAuthority: LivePaymentProcessingAuthority = record;

void asLivePaymentAuthority;

// @ts-expect-error Sandbox record cannot give GTIS write authority.
const asGTISWriteAuthority: GTISWriteAuthority = record;

void asGTISWriteAuthority;

// @ts-expect-error Sandbox record cannot give PAI-SAFE authority.
const asPaiSafeAuthority: PaiSafeAuthority = record;

void asPaiSafeAuthority;

// @ts-expect-error Sandbox record cannot give FinTechionAI command authority.
const asFinTechionAuthority: FinTechionCommandAuthority = record;

void asFinTechionAuthority;

// @ts-expect-error Sandbox record cannot create live rails.
record.boundary.noLiveRailsCreated = false;

// @ts-expect-error Sandbox record cannot create live payment processing.
record.boundary.noLivePaymentProcessingCreated = false;

// @ts-expect-error Sandbox record cannot create live ATS.
record.boundary.noLiveATSCreated = false;

// @ts-expect-error GTIS must not gain write authority.
record.boundary.gtisHasNoWriteAuthority = false;

const sandboxAts: SandboxActivatedTransactionState = {
  __brand: "SANDBOX_ACTIVATED_TRANSACTION_STATE",
  atsRef: "sandbox_ats_compile_txn",
  transactionRef: "compile_txn",
  fundTrackerDecisionRef: "ft_sandbox_decision_compile_txn",
  verifiedOpportunityRef: "sandbox_verified_opportunity_compile_txn",
  processorEventRef: "sandbox_processor_event_compile_txn",
  emittedBy: "FundTrackerAI",
  sandboxOnly: true,
  liveAts: false,
  createdAt: "2026-04-28T00:00:00.000Z"
};

void sandboxAts;

// @ts-expect-error Sandbox ATS cannot become live ATS.
const asLiveATS: LiveActivatedTransactionState = sandboxAts;

void asLiveATS;

// @ts-expect-error Sandbox ATS cannot be marked live.
sandboxAts.liveAts = true;

// @ts-expect-error Sandbox ATS must be emitted by FundTrackerAI.
sandboxAts.emittedBy = "GTIS";
