export type LegalStudioEscrowSimulationStatus =
  | "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_READY"
  | "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_BLOCKED"
  | "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_REFUSED";

export type SandboxEscrowLedgerState =
  | "HOLD_REQUESTED_SANDBOX"
  | "HOLD_PLACED_SANDBOX"
  | "RELEASE_CONDITION_MET_SANDBOX"
  | "RELEASE_EXECUTED_SANDBOX"
  | "REFUND_AVAILABLE_SANDBOX"
  | "DISPUTE_HOLD_AVAILABLE_SANDBOX";

export type MovementKind =
  | "INFORMATION"
  | "DOCUMENT"
  | "CONSENT"
  | "GOVERNED_TRANSACTION_REQUEST"
  | "SANDBOX_MONEY_LOGIC"
  | "SANDBOX_RELEASE_NOTICE";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface RealEscrowAuthority {
  readonly __brand: "REAL_ESCROW_AUTHORITY";
  mayHoldClientFunds: true;
}

export interface LegalAuthority {
  readonly __brand: "LEGAL_AUTHORITY";
  mayCreateLegalAuthority: true;
}

export interface FinancialAuthority {
  readonly __brand: "FINANCIAL_AUTHORITY";
  mayCreateFinancialAuthority: true;
}

export interface PublicLaunchAuthority {
  readonly __brand: "PUBLIC_LAUNCH_AUTHORITY";
  mayLaunchPublicly: true;
}

export interface SharedMatterIdentity {
  matterId: "LA-2026-0012";
  transactionId: "TRUTH-00045";
  clientId: "CLIENT-001";
  lawStudioId: "LAW-STUDIO-001";
  financialInstitutionId: "FI-SANDBOX-001";
  environment: "SANDBOX";
}

export interface PersistentSandboxIndicator {
  label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE";
  visibleOnClientView: true;
  visibleOnLawStudioView: true;
  visibleOnFinancialInstitutionView: true;
  visibleOnDashboardHeader: true;
  boundaryText: string;
}

export interface ClientView {
  readonly __brand: "CLIENT_VIEW";
  title: "LawAidAI — My Legal Matter";
  matterId: string;
  transactionId: string;
  visibleStatus: "ENGAGEMENT_APPROVED_FUNDS_HELD_SANDBOX";
  clientActions: string[];
  clientSees: string[];
  releaseNotice: string;
  sandboxIndicator: PersistentSandboxIndicator;
}

export interface LawStudioView {
  readonly __brand: "LAW_STUDIO_VIEW";
  title: "LawAidAI for Small Firms";
  matterId: string;
  transactionId: string;
  visibleStatus: "COMMITMENT_VERIFIED_FUNDS_RESERVED_SANDBOX";
  studioActions: string[];
  studioSees: string[];
  payoutNotice: string;
  sandboxIndicator: PersistentSandboxIndicator;
}

export interface FinancialInstitutionView {
  readonly __brand: "FINANCIAL_INSTITUTION_VIEW";
  title: "Governed Hold & Release — FI Sandbox";
  matterId: string;
  transactionId: string;
  visibleStatus: "SANDBOX_HOLD_RELEASE_READY";
  incomingGovernedRequest: string[];
  stateMachine: SandboxEscrowLedgerState[];
  evidenceBundleRefs: string[];
  sandboxIndicator: PersistentSandboxIndicator;
}

export interface MovementTimelineEntry {
  step: number;
  timestamp: string;
  movementKind: MovementKind;
  from: "CLIENT" | "LAWAIDAI" | "LAW_STUDIO" | "FINANCIAL_INSTITUTION" | "SANDBOX_RAIL";
  to: "CLIENT" | "LAWAIDAI" | "LAW_STUDIO" | "FINANCIAL_INSTITUTION" | "SANDBOX_RAIL";
  whatMoved: string;
  whyItMoved: string;
  artifactCreated: string;
  boundary: {
    sandboxOnly: true;
    createsNoRealFundsMovement: true;
    createsNoLegalAuthority: true;
    createsNoFinancialAuthority: true;
  };
}

export interface SandboxHoldReleaseLedgerEntry {
  ledgerEntryId: string;
  transactionId: string;
  state: SandboxEscrowLedgerState;
  amount: 1500;
  currency: "USD";
  simulatedOnly: true;
  fundsActuallyMoved: false;
  custodyTransferred: false;
  reason: string;
  evidenceRef: string;
}

export interface EvidenceBundle {
  readonly __brand: "LEGAL_STUDIO_ESCROW_EVIDENCE_BUNDLE";
  matterId: string;
  transactionId: string;
  engagementTermsRef: "engagement_terms_demo_001";
  clientApprovalRef: "client_approval_demo_001";
  paymentRulesRef: "payment_rules_demo_001";
  milestoneProofRef: "milestone_delivery_demo_001";
  releaseDecisionRef: "release_decision_demo_001";
  lawAidAIRecordRef: "lawaidai_record_demo_001";
  fundTrackerDecisionRef: "fundtrackerai_demo_validity_decision_001";
  boundary: {
    evidenceIsSandboxOnly: true;
    evidenceCreatesNoLegalAuthority: true;
    evidenceCreatesNoFinancialAuthority: true;
    evidenceCreatesNoCustodyTransfer: true;
  };
}

export interface LegalStudioEscrowSandboxSimulation {
  readonly __brand: "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION";
  status: LegalStudioEscrowSimulationStatus;
  sharedIdentity: SharedMatterIdentity;
  sandboxIndicator: PersistentSandboxIndicator;
  thesis: string;
  executiveLine: string;
  clientView: ClientView;
  lawStudioView: LawStudioView;
  financialInstitutionView: FinancialInstitutionView;
  movementTimeline: MovementTimelineEntry[];
  sandboxLedger: SandboxHoldReleaseLedgerEntry[];
  evidenceBundle: EvidenceBundle;
  boundary: {
    simulationOnly: true;
    noLiveRailsCreated: true;
    noLivePaymentProcessingCreated: true;
    noRealFundsMoved: true;
    noRealEscrowCreated: true;
    noLiveSettlementCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
    noLegalAuthorityCreated: true;
    noFinancialAuthorityCreated: true;
    notPublicLaunchApproval: true;
  };
}

function timestamp(step: number): string {
  return `2026-04-28T12:0${step}:00.000Z`;
}

export function buildPersistentSandboxIndicator(): PersistentSandboxIndicator {
  return {
    label: "SANDBOX SIMULATION — NO REAL FUNDS MOVE",
    visibleOnClientView: true,
    visibleOnLawStudioView: true,
    visibleOnFinancialInstitutionView: true,
    visibleOnDashboardHeader: true,
    boundaryText:
      "This is a governed sandbox simulation. No live rail is connected. No real funds move. No legal, financial, custody, escrow, settlement, or launch authority is created."
  };
}

export function buildSharedMatterIdentity(): SharedMatterIdentity {
  return {
    matterId: "LA-2026-0012",
    transactionId: "TRUTH-00045",
    clientId: "CLIENT-001",
    lawStudioId: "LAW-STUDIO-001",
    financialInstitutionId: "FI-SANDBOX-001",
    environment: "SANDBOX"
  };
}

export function buildEvidenceBundle(identity = buildSharedMatterIdentity()): EvidenceBundle {
  return {
    __brand: "LEGAL_STUDIO_ESCROW_EVIDENCE_BUNDLE",
    matterId: identity.matterId,
    transactionId: identity.transactionId,
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
  };
}

export function buildClientView(identity = buildSharedMatterIdentity()): ClientView {
  const sandboxIndicator = buildPersistentSandboxIndicator();

  return {
    __brand: "CLIENT_VIEW",
    title: "LawAidAI — My Legal Matter",
    matterId: identity.matterId,
    transactionId: identity.transactionId,
    visibleStatus: "ENGAGEMENT_APPROVED_FUNDS_HELD_SANDBOX",
    clientActions: [
      "Client starts legal matter.",
      "Client reviews engagement terms.",
      "Client approves governed payment hold rules.",
      "Client later receives release explanation."
    ],
    clientSees: [
      "Matter created.",
      "Engagement terms generated.",
      "Funds held by FI sandbox under verified conditions.",
      "Funds released because milestone delivery was verified."
    ],
    releaseNotice:
      "Funds released in sandbox because the law studio completed the verified milestone and the client-approved release condition was met.",
    sandboxIndicator
  };
}

export function buildLawStudioView(identity = buildSharedMatterIdentity()): LawStudioView {
  const sandboxIndicator = buildPersistentSandboxIndicator();

  return {
    __brand: "LAW_STUDIO_VIEW",
    title: "LawAidAI for Small Firms",
    matterId: identity.matterId,
    transactionId: identity.transactionId,
    visibleStatus: "COMMITMENT_VERIFIED_FUNDS_RESERVED_SANDBOX",
    studioActions: [
      "Law studio receives structured matter package.",
      "Law studio sees engagement and payment rules.",
      "Law studio uploads milestone deliverable.",
      "Law studio receives sandbox payout confirmation."
    ],
    studioSees: [
      "Commitment verified.",
      "Funds reserved with FI sandbox.",
      "Milestone marked complete.",
      "Sandbox release executed."
    ],
    payoutNotice:
      "Sandbox payout released after verified milestone completion. This is not live settlement or real funds movement.",
    sandboxIndicator
  };
}

export function buildFinancialInstitutionView(identity = buildSharedMatterIdentity()): FinancialInstitutionView {
  const sandboxIndicator = buildPersistentSandboxIndicator();

  return {
    __brand: "FINANCIAL_INSTITUTION_VIEW",
    title: "Governed Hold & Release — FI Sandbox",
    matterId: identity.matterId,
    transactionId: identity.transactionId,
    visibleStatus: "SANDBOX_HOLD_RELEASE_READY",
    incomingGovernedRequest: [
      "Verified client identity reference.",
      "Verified law studio identity reference.",
      "Engagement summary.",
      "Payment rules.",
      "Client approval.",
      "Release condition.",
      "Evidence bundle."
    ],
    stateMachine: [
      "HOLD_REQUESTED_SANDBOX",
      "HOLD_PLACED_SANDBOX",
      "RELEASE_CONDITION_MET_SANDBOX",
      "RELEASE_EXECUTED_SANDBOX"
    ],
    evidenceBundleRefs: [
      "engagement_terms_demo_001",
      "client_approval_demo_001",
      "payment_rules_demo_001",
      "milestone_delivery_demo_001",
      "release_decision_demo_001"
    ],
    sandboxIndicator
  };
}

export function buildMovementTimeline(identity = buildSharedMatterIdentity()): MovementTimelineEntry[] {
  const baseBoundary = {
    sandboxOnly: true,
    createsNoRealFundsMovement: true,
    createsNoLegalAuthority: true,
    createsNoFinancialAuthority: true
  } as const;

  return [
    {
      step: 1,
      timestamp: timestamp(1),
      movementKind: "INFORMATION",
      from: "CLIENT",
      to: "LAWAIDAI",
      whatMoved: "Legal matter facts, client intent, preferred constraints.",
      whyItMoved: "LawAidAI needs structured intake to create the matter record.",
      artifactCreated: `Matter ${identity.matterId}`,
      boundary: baseBoundary
    },
    {
      step: 2,
      timestamp: timestamp(2),
      movementKind: "DOCUMENT",
      from: "LAWAIDAI",
      to: "LAW_STUDIO",
      whatMoved: "Structured matter package, engagement terms, payment rules.",
      whyItMoved: "Law studio needs client matter context and governed rules.",
      artifactCreated: "engagement_terms_demo_001",
      boundary: baseBoundary
    },
    {
      step: 3,
      timestamp: timestamp(3),
      movementKind: "CONSENT",
      from: "CLIENT",
      to: "LAWAIDAI",
      whatMoved: "Client approval of legal terms and governed payment hold rules.",
      whyItMoved: "Governed transaction request requires client-approved conditions.",
      artifactCreated: "client_approval_demo_001",
      boundary: baseBoundary
    },
    {
      step: 4,
      timestamp: timestamp(4),
      movementKind: "GOVERNED_TRANSACTION_REQUEST",
      from: "LAWAIDAI",
      to: "FINANCIAL_INSTITUTION",
      whatMoved: "Identities, terms, commitment rules, release conditions, consent proof.",
      whyItMoved: "FI sandbox needs transaction truth before sandbox hold.",
      artifactCreated: `Txn ${identity.transactionId}`,
      boundary: baseBoundary
    },
    {
      step: 5,
      timestamp: timestamp(5),
      movementKind: "SANDBOX_MONEY_LOGIC",
      from: "FINANCIAL_INSTITUTION",
      to: "SANDBOX_RAIL",
      whatMoved: "Sandbox hold request and ledger state.",
      whyItMoved: "Simulate FI-controlled hold without real funds movement.",
      artifactCreated: "hold_placed_sandbox_001",
      boundary: baseBoundary
    },
    {
      step: 6,
      timestamp: timestamp(6),
      movementKind: "DOCUMENT",
      from: "LAW_STUDIO",
      to: "LAWAIDAI",
      whatMoved: "Milestone delivery proof.",
      whyItMoved: "LawAidAI verifies release condition.",
      artifactCreated: "milestone_delivery_demo_001",
      boundary: baseBoundary
    },
    {
      step: 7,
      timestamp: timestamp(7),
      movementKind: "SANDBOX_RELEASE_NOTICE",
      from: "FINANCIAL_INSTITUTION",
      to: "LAW_STUDIO",
      whatMoved: "Sandbox release confirmation.",
      whyItMoved: "Verified release condition was met.",
      artifactCreated: "release_executed_sandbox_001",
      boundary: baseBoundary
    },
    {
      step: 8,
      timestamp: timestamp(8),
      movementKind: "SANDBOX_RELEASE_NOTICE",
      from: "FINANCIAL_INSTITUTION",
      to: "CLIENT",
      whatMoved: "Release explanation and evidence reference.",
      whyItMoved: "Client sees why the sandbox release occurred.",
      artifactCreated: "client_release_notice_demo_001",
      boundary: baseBoundary
    }
  ];
}

export function buildSandboxLedger(identity = buildSharedMatterIdentity()): SandboxHoldReleaseLedgerEntry[] {
  return [
    {
      ledgerEntryId: "ledger_hold_requested_001",
      transactionId: identity.transactionId,
      state: "HOLD_REQUESTED_SANDBOX",
      amount: 1500,
      currency: "USD",
      simulatedOnly: true,
      fundsActuallyMoved: false,
      custodyTransferred: false,
      reason: "Client approved governed hold rules.",
      evidenceRef: "client_approval_demo_001"
    },
    {
      ledgerEntryId: "ledger_hold_placed_001",
      transactionId: identity.transactionId,
      state: "HOLD_PLACED_SANDBOX",
      amount: 1500,
      currency: "USD",
      simulatedOnly: true,
      fundsActuallyMoved: false,
      custodyTransferred: false,
      reason: "FI sandbox placed simulated hold.",
      evidenceRef: "payment_rules_demo_001"
    },
    {
      ledgerEntryId: "ledger_release_condition_met_001",
      transactionId: identity.transactionId,
      state: "RELEASE_CONDITION_MET_SANDBOX",
      amount: 1500,
      currency: "USD",
      simulatedOnly: true,
      fundsActuallyMoved: false,
      custodyTransferred: false,
      reason: "LawAidAI verified milestone delivery.",
      evidenceRef: "milestone_delivery_demo_001"
    },
    {
      ledgerEntryId: "ledger_release_executed_001",
      transactionId: identity.transactionId,
      state: "RELEASE_EXECUTED_SANDBOX",
      amount: 1500,
      currency: "USD",
      simulatedOnly: true,
      fundsActuallyMoved: false,
      custodyTransferred: false,
      reason: "Sandbox release executed after verified condition.",
      evidenceRef: "release_decision_demo_001"
    }
  ];
}

export function buildLegalStudioEscrowSandboxSimulation(): LegalStudioEscrowSandboxSimulation {
  const sharedIdentity = buildSharedMatterIdentity();
  const sandboxIndicator = buildPersistentSandboxIndicator();

  return {
    __brand: "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION",
    status: "LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_READY",
    sharedIdentity,
    sandboxIndicator,
    thesis:
      "One legal matter, one governed transaction, three synchronized perspectives, one sandbox truth chain.",
    executiveLine:
      "We are showing the financial institution what they usually do not see: the legal reason, client consent, merchant obligation, evidence trail, and release condition before funds move.",
    clientView: buildClientView(sharedIdentity),
    lawStudioView: buildLawStudioView(sharedIdentity),
    financialInstitutionView: buildFinancialInstitutionView(sharedIdentity),
    movementTimeline: buildMovementTimeline(sharedIdentity),
    sandboxLedger: buildSandboxLedger(sharedIdentity),
    evidenceBundle: buildEvidenceBundle(sharedIdentity),
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
}

export const LEGAL_STUDIO_ESCROW_SANDBOX_SIMULATION_DOCTRINE = {
  name: "Legal Studio Escrow Sandbox Simulation",
  class: "THREE_PERSPECTIVE_LEGAL_ESCROW_SANDBOX_DEMO",
  purpose:
    "Show one legal matter and one governed transaction across client, law studio, and financial institution views while making information movement, sandbox hold/release logic, evidence, and boundaries visible.",
  boundary: {
    sandboxOnly: true,
    persistentSandboxIndicatorRequired: true,
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
} as const;
