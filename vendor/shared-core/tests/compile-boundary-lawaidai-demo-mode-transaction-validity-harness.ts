import type {
  DemoActivatedTransactionState,
  FinancialAuthority,
  LawAidAIDemoRunRecord,
  LegalAuthority,
  LiveActivatedTransactionStateAuthority,
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  PublicLaunchAuthority
} from "../lawaidai-demo-mode-transaction-validity-harness";

const demoAts: DemoActivatedTransactionState = {
  __brand: "DEMO_ACTIVATED_TRANSACTION_STATE",
  transactionId: "demo_tx_001",
  demoAtsId: "demo_ats_001",
  authId: "demo_auth_001",
  validity: "verified",
  mode: "demo",
  capture: "not_executed",
  settlement: "not_executed",
  authority: "none",
  fundTrackerDecisionId: "fundtrackerai_demo_validity_decision_001",
  verifiedOpportunityId: "aiop_verified_opportunity_demo_001",
  createdAt: "2026-04-28T00:00:00.000Z",
  boundary: {
    demoAtsOnly: true,
    notLiveATS: true,
    createsNoLiveTransactionTruth: true,
    createsNoPaymentProcessing: true,
    createsNoFundsCapture: true,
    createsNoSettlement: true,
    createsNoCustodyTransfer: true,
    createsNoRuntimeActivation: true,
    createsNoLegalAuthority: true,
    createsNoFinancialAuthority: true
  }
};

void demoAts;

// @ts-expect-error Demo ATS cannot become live ATS authority.
const asLiveATSAuthority: LiveActivatedTransactionStateAuthority = demoAts;

void asLiveATSAuthority;

// @ts-expect-error Demo ATS cannot become payment authority.
const asPaymentAuthority: LivePaymentProcessingAuthority = demoAts;

void asPaymentAuthority;

// @ts-expect-error Demo ATS cannot create legal authority.
const asLegalAuthority: LegalAuthority = demoAts;

void asLegalAuthority;

// @ts-expect-error Demo ATS cannot create financial authority.
const asFinancialAuthority: FinancialAuthority = demoAts;

void asFinancialAuthority;

// @ts-expect-error Demo ATS cannot become live ATS.
demoAts.boundary.notLiveATS = false;

// @ts-expect-error Demo ATS cannot create payment processing.
demoAts.boundary.createsNoPaymentProcessing = false;

// @ts-expect-error Demo ATS cannot create settlement.
demoAts.boundary.createsNoSettlement = false;

const runRecord: LawAidAIDemoRunRecord = {
  __brand: "LAWAIDAI_DEMO_RUN_RECORD",
  runId: "lawaidai_demo_run_001",
  status: "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_READY",
  stage: "LAWAIDAI_DEMO_UNLOCK",
  refusalCodes: [],
  approvedDemoLanguage: [],
  prohibitedDemoLanguage: [],
  boundary: {
    demoOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noFundsCaptured: true,
    noSettlementCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalAuthorityCreated: true,
    noFinancialAuthorityCreated: true,
    notPublicLaunchApproval: true
  }
};

void runRecord;

// @ts-expect-error Demo run cannot become live rail authority.
const runAsLiveRail: LiveRailAuthority = runRecord;

void runAsLiveRail;

// @ts-expect-error Demo run cannot become launch authority.
const runAsLaunch: PublicLaunchAuthority = runRecord;

void runAsLaunch;

// @ts-expect-error Demo run cannot create live rails.
runRecord.boundary.noLiveRailsCreated = false;

// @ts-expect-error Demo run cannot create live payment processing.
runRecord.boundary.noLivePaymentProcessingCreated = false;

// @ts-expect-error Demo run cannot become public launch approval.
runRecord.boundary.notPublicLaunchApproval = false;
