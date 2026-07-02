import type {
  FinancialAuthority,
  LegalAuthority,
  LegalStudioEscrowSandboxSimulation,
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  PublicLaunchAuthority,
  RealEscrowAuthority
} from "../legal-studio-escrow-sandbox-simulation";

const simulation: LegalStudioEscrowSandboxSimulation = {
  __brand: "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION",
  status: "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_READY",
  sharedIdentity: {
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    clientId: "CLIENT-001",
    lawStudioId: "LAW-STUDIO-001",
    financialInstitutionId: "FI-SANDBOX-001",
    environment: "SANDBOX"
  },
  sandboxIndicator: {
    label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE",
    visibleOnClientView: true,
    visibleOnLawStudioView: true,
    visibleOnFinancialInstitutionView: true,
    visibleOnDashboardHeader: true,
    boundaryText: "sandbox"
  },
  thesis: "compile",
  executiveLine: "compile",
  clientView: {
    __brand: "CLIENT_VIEW",
    title: "LawAidAI — My Legal Matter",
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    visibleStatus: "ENGAGEMENT_APPROVED_FUNDS_HELD_SANDBOX",
    clientActions: [],
    clientSees: [],
    releaseNotice: "compile",
    sandboxIndicator: {
      label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE",
      visibleOnClientView: true,
      visibleOnLawStudioView: true,
      visibleOnFinancialInstitutionView: true,
      visibleOnDashboardHeader: true,
      boundaryText: "sandbox"
    }
  },
  lawStudioView: {
    __brand: "LAW_STUDIO_VIEW",
    title: "LawAidAI for Small Firms",
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    visibleStatus: "COMMITMENT_VERIFIED_FUNDS_RESERVED_SANDBOX",
    studioActions: [],
    studioSees: [],
    payoutNotice: "compile",
    sandboxIndicator: {
      label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE",
      visibleOnClientView: true,
      visibleOnLawStudioView: true,
      visibleOnFinancialInstitutionView: true,
      visibleOnDashboardHeader: true,
      boundaryText: "sandbox"
    }
  },
  financialInstitutionView: {
    __brand: "FINANCIAL_INSTITUTION_VIEW",
    title: "Governed Hold & Release — FI Sandbox",
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    visibleStatus: "SANDBOX_HOLD_RELEASE_READY",
    incomingGovernedRequest: [],
    stateMachine: [
      "HOLD_REQUESTED_SANDBOX",
      "HOLD_PLACED_SANDBOX",
      "RELEASE_CONDITION_MET_SANDBOX",
      "RELEASE_EXECUTED_SANDBOX"
    ],
    evidenceBundleRefs: [],
    sandboxIndicator: {
      label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE",
      visibleOnClientView: true,
      visibleOnLawStudioView: true,
      visibleOnFinancialInstitutionView: true,
      visibleOnDashboardHeader: true,
      boundaryText: "sandbox"
    }
  },
  movementTimeline: [],
  sandboxLedger: [],
  evidenceBundle: {
    __brand: "LEGAL_STUDIO_ESCROW_EVIDENCE_BUNDLE",
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    engagementTermsRef: "engagement_terms_demo_001",
    clientApprovalRef: "client_approval_demo_001",
    paymentRulesRef: "payment_rules_demo_001",
    milestoneProofRef: "milestone_delivery_demo_001",
    releaseDecisionRef: "release_decision_demo_001",
    lawAidAIRecordRef: "lawaidai_record_demo_001",
    fundTrackerDecisionRef: "fundtrackerai_demo_validity_decision_001",
    boundary: {
      evidenceIsSandboxOnly: true,
      evidenceCreatesNoLegalAuthority: true,
      evidenceCreatesNoFinancialAuthority: true,
      evidenceCreatesNoCustodyTransfer: true
    }
  },
  boundary: {
    simulationOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noRealFundsMoved: true,
    noRealEscrowCreated: true,
    noLiveSettlementCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalAuthorityCreated: true,
    noFinancialAuthorityCreated: true,
    notPublicLaunchApproval: true
  }
};

void simulation;

// @ts-expect-error Simulation cannot become live rail authority.
const asLiveRail: LiveRailAuthority = simulation;

void asLiveRail;

// @ts-expect-error Simulation cannot become payment processing authority.
const asPayment: LivePaymentProcessingAuthority = simulation;

void asPayment;

// @ts-expect-error Simulation cannot become real escrow authority.
const asEscrow: RealEscrowAuthority = simulation;

void asEscrow;

// @ts-expect-error Simulation cannot become legal authority.
const asLegal: LegalAuthority = simulation;

void asLegal;

// @ts-expect-error Simulation cannot become financial authority.
const asFinancial: FinancialAuthority = simulation;

void asFinancial;

// @ts-expect-error Simulation cannot become public launch authority.
const asLaunch: PublicLaunchAuthority = simulation;

void asLaunch;

// @ts-expect-error Simulation cannot create live rails.
simulation.boundary.noLiveRailsCreated = false;

// @ts-expect-error Simulation cannot create real funds movement.
simulation.boundary.noRealFundsMoved = false;

// @ts-expect-error Simulation cannot create real escrow.
simulation.boundary.noRealEscrowCreated = false;

// @ts-expect-error Simulation cannot become public launch approval.
simulation.boundary.notPublicLaunchApproval = false;
