export type ExecutiveConsoleStatus =
  | "EXECUTIVE_SIMULATION_CONSOLE_PACKET_READY"
  | "EXECUTIVE_SIMULATION_CONSOLE_PACKET_BLOCKED"
  | "EXECUTIVE_SIMULATION_CONSOLE_PACKET_REFUSED";

export type ExecutiveAudience =
  | "FINANCIAL_INSTITUTION"
  | "LAW_STUDIO"
  | "INVESTOR"
  | "PRIVATE_REVIEW";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentAuthority {
  readonly __brand: "LIVE_PAYMENT_AUTHORITY";
  mayProcessPayment: true;
}

export interface PublicLaunchAuthority {
  readonly __brand: "PUBLIC_LAUNCH_AUTHORITY";
  mayLaunchPublicly: true;
}

export interface LegalAuthority {
  readonly __brand: "LEGAL_AUTHORITY";
  mayCreateLegalAuthority: true;
}

export interface FinancialAuthority {
  readonly __brand: "FINANCIAL_AUTHORITY";
  mayCreateFinancialAuthority: true;
}

export interface ExecutiveClaimGuard {
  approvedClaims: string[];
  prohibitedClaims: string[];
  requiredBoundaryLanguage: string[];
  boundary: {
    readonly claimGuardIsNonAuthoritative: true;
    readonly createsNoLiveRailAuthority: true;
    readonly createsNoPaymentAuthority: true;
    readonly createsNoLegalAuthority: true;
    readonly createsNoFinancialAuthority: true;
    readonly createsNoLaunchAuthority: true;
  };
}

export interface ExecutiveDemoStep {
  step: number;
  title: string;
  speakerLine: string;
  visualFocus: string;
  proofArtifact: string;
  boundaryReminder: string;
}

export interface ExecutiveSimulationConsolePacket {
  readonly __brand: "EXECUTIVE_SIMULATION_CONSOLE_PACKET";
  status: ExecutiveConsoleStatus;
  audience: ExecutiveAudience;
  title: "One Matter. One Transaction. Three Perspectives. One Governed Truth.";
  coreThesis: string;
  executiveLine: string;
  demoSteps: ExecutiveDemoStep[];
  claimGuard: ExecutiveClaimGuard;
  visibleArtifacts: string[];
  consoleFiles: string[];
  boundary: {
    readonly sandboxOnly: true;
    readonly reviewOnly: true;
    readonly noLiveRailsCreated: true;
    readonly noLivePaymentProcessingCreated: true;
    readonly noRealFundsMoved: true;
    readonly noRealEscrowCreated: true;
    readonly noSettlementCreated: true;
    readonly noCustodyTransferCreated: true;
    readonly noRuntimeActivationCreated: true;
    readonly noLegalAuthorityCreated: true;
    readonly noFinancialAuthorityCreated: true;
    readonly notPublicLaunchApproval: true;
  };
}

export function buildExecutiveClaimGuard(): ExecutiveClaimGuard {
  return {
    approvedClaims: [
      "This is a sandbox simulation.",
      "No real funds move.",
      "LawAidAI shows the legal workflow and evidence chain.",
      "FundTrackerAI / GTIS shows transaction truth before funds release.",
      "The financial institution view shows governed hold and release logic.",
      "The demo shows how information, consent, documents, and money logic move together.",
      "The demo does not process payments or create financial authority."
    ],
    prohibitedClaims: [
      "This processes live payments.",
      "This moves real client funds.",
      "This creates real escrow.",
      "This creates legal authority.",
      "This creates financial authority.",
      "This settles money.",
      "This is public launch approval.",
      "This replaces the bank rail.",
      "PAI-SAFE or the UI creates transaction truth."
    ],
    requiredBoundaryLanguage: [
      "Sandbox simulation only.",
      "No live rail connected.",
      "No real funds move.",
      "No legal or financial authority created.",
      "Not public launch approval."
    ],
    boundary: {
      claimGuardIsNonAuthoritative: true,
      createsNoLiveRailAuthority: true,
      createsNoPaymentAuthority: true,
      createsNoLegalAuthority: true,
      createsNoFinancialAuthority: true,
      createsNoLaunchAuthority: true
    }
  };
}

export function buildExecutiveDemoSteps(): ExecutiveDemoStep[] {
  return [
    {
      step: 1,
      title: "Open the sandbox",
      speakerLine:
        "This is a sandbox-only simulation. No live rail is connected and no real funds move.",
      visualFocus: "Persistent sandbox banner and shared IDs.",
      proofArtifact: "legal-studio-escrow-sandbox-record.json",
      boundaryReminder: "Sandbox only. Not launch approval."
    },
    {
      step: 2,
      title: "Client starts the legal matter",
      speakerLine:
        "The client begins in LawAidAI. Their facts, consent, engagement terms, and payment rules become structured artifacts.",
      visualFocus: "Client View panel.",
      proofArtifact: "Matter LA-2026-0012",
      boundaryReminder: "Client approval is sandbox evidence, not live financial authority."
    },
    {
      step: 3,
      title: "Law studio sees the operator workflow",
      speakerLine:
        "The law studio receives the structured matter, terms, obligations, and funds-held status in one continuous workflow.",
      visualFocus: "Law Studio View panel.",
      proofArtifact: "engagement_terms_demo_001",
      boundaryReminder: "Studio payout shown is sandbox confirmation only."
    },
    {
      step: 4,
      title: "Financial institution sees governed transaction truth",
      speakerLine:
        "This is what the FI usually does not see before funds move: legal reason, client consent, merchant obligation, evidence trail, and release condition.",
      visualFocus: "Financial Institution View panel.",
      proofArtifact: "Txn TRUTH-00045",
      boundaryReminder: "FI view is sandbox hold/release logic only."
    },
    {
      step: 5,
      title: "Trace what moved where and when",
      speakerLine:
        "Every movement is labeled: who sent it, who received it, what moved, why it moved, and what artifact was created.",
      visualFocus: "Movement Timeline table.",
      proofArtifact: "movementTimeline",
      boundaryReminder: "Timeline creates no legal or financial authority."
    },
    {
      step: 6,
      title: "Show sandbox hold and release",
      speakerLine:
        "The ledger shows hold requested, hold placed, release condition met, and release executed — all simulated, with no real funds or custody transfer.",
      visualFocus: "Sandbox Hold / Release Ledger.",
      proofArtifact: "sandboxLedger",
      boundaryReminder: "Sandbox ledger is not a bank ledger."
    },
    {
      step: 7,
      title: "Close the executive thesis",
      speakerLine:
        "LawAidAI proves the workflow. FundTrackerAI proves the transaction truth. GTIS shows why the rail should not have to guess.",
      visualFocus: "Executive thesis / final boundary panel.",
      proofArtifact: "executive-simulation-console-packet.json",
      boundaryReminder: "Review only. No public launch approval."
    }
  ];
}

export function buildExecutiveSimulationConsolePacket(): ExecutiveSimulationConsolePacket {
  return {
    __brand: "EXECUTIVE_SIMULATION_CONSOLE_PACKET",
    status: "EXECUTIVE_SIMULATION_CONSOLE_PACKET_READY",
    audience: "FINANCIAL_INSTITUTION",
    title: "One Matter. One Transaction. Three Perspectives. One Governed Truth.",
    coreThesis:
      "LawAidAI governs the legal workflow, FundTrackerAI governs transaction truth, and the FI sees the governed conditions before sandbox funds release.",
    executiveLine:
      "We are showing the financial institution what they usually do not see: the legal reason, client consent, merchant obligation, evidence trail, and release condition before funds move.",
    demoSteps: buildExecutiveDemoSteps(),
    claimGuard: buildExecutiveClaimGuard(),
    visibleArtifacts: [
      "legal-studio-escrow-sandbox-dashboard.html",
      "legal-studio-escrow-sandbox-handoff.md",
      "legal-studio-escrow-sandbox-record.json",
      "executive-speaker-script.md",
      "executive-review-checklist.md"
    ],
    consoleFiles: [],
    boundary: {
      sandboxOnly: true,
      reviewOnly: true,
      noLiveRailsCreated: true,
      noLivePaymentProcessingCreated: true,
      noRealFundsMoved: true,
      noRealEscrowCreated: true,
      noSettlementCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true,
      noLegalAuthorityCreated: true,
      noFinancialAuthorityCreated: true,
      notPublicLaunchApproval: true
    }
  };
}

export const EXECUTIVE_SIMULATION_CONSOLE_PACKET_DOCTRINE = {
  name: "Executive Simulation Console Packet",
  class: "EXECUTIVE_DEMO_PACKET_FOR_LEGAL_STUDIO_ESCROW_SANDBOX",
  purpose:
    "Package the sealed legal studio escrow sandbox simulation into a visual, pitch-safe, executive-ready console with speaker script, claim guard, artifacts, and review checklist.",
  boundary: {
    sandboxOnly: true,
    reviewOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noRealFundsMoved: true,
    noRealEscrowCreated: true,
    noSettlementCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalAuthorityCreated: true,
    noFinancialAuthorityCreated: true,
    notPublicLaunchApproval: true
  }
} as const;
