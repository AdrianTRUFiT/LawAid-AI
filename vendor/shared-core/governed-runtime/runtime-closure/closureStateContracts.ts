export type RuntimeClosureState =
  | "CLEARED"
  | "CONSTRAINED"
  | "HELD"
  | "REFUSED";

export type ProposedAction =
  | "connect"
  | "activate"
  | "advance"
  | "attach"
  | "handoff";

export type SupportStatus =
  | "SUPPORTED"
  | "DEGRADED"
  | "BROKEN"
  | "ORPHANED";

export type ContinuityStatus =
  | "INTACT"
  | "FRAGILE"
  | "UNRESOLVED"
  | "BROKEN";

export type TimingStatus =
  | "VALID"
  | "STALE"
  | "EXPIRED"
  | "UNKNOWN";

export type HazardStatus =
  | "CLEAR"
  | "ELEVATED"
  | "ACTIVE";

export type MaturityStatus =
  | "SUFFICIENT"
  | "EARLY"
  | "INSUFFICIENT";

export type ProposalContext = {
  proposalId: string;
  proposedAction: ProposedAction;
  targetId?: string;
  sourceId?: string;
  requestedAt: string;
};

export type RuntimeTruthInput = {
  runtimeState: {
    visibleReady: boolean;
    activeState: boolean;
    reviewed: boolean;
    proposalAttachable: boolean;
  };
  supportState: {
    supportStatus: SupportStatus;
    supportingIds: string[];
    degradedIds: string[];
    orphanedIds: string[];
  };
  continuityState: {
    continuityStatus: ContinuityStatus;
    lineageIntact: boolean;
    unresolvedCount: number;
    brokenCount: number;
  };
  timingState: {
    timingStatus: TimingStatus;
    windowOpen: boolean;
    staleByMs?: number;
  };
  hazardState: {
    hazardStatus: HazardStatus;
    activeHazards: string[];
  };
  maturityState: {
    maturityStatus: MaturityStatus;
    maturityScore: number;
  };
  anomalyState?: {
    anomalySignals: string[];
  };
};

export type ClosureReason =
  | "HARD_INVALID_PROPOSAL"
  | "PROPOSAL_NOT_ATTACHABLE"
  | "VISIBLE_READINESS_FALSE"
  | "SUPPORT_BROKEN"
  | "SUPPORT_ORPHANED"
  | "SUPPORT_DEGRADED"
  | "CONTINUITY_BROKEN"
  | "CONTINUITY_UNRESOLVED"
  | "TIMING_EXPIRED"
  | "TIMING_STALE"
  | "HAZARD_ACTIVE"
  | "HAZARD_ELEVATED"
  | "MATURITY_INSUFFICIENT"
  | "MATURITY_EARLY"
  | "ANOMALY_PRESENT"
  | "READY_WITH_LIMITS"
  | "READY";

export type ClosureDecisionEnvelope = {
  proposalId: string;
  proposedAction: ProposedAction;
  runtimeClosureState: RuntimeClosureState;
  runtimeReasons: ClosureReason[];
  continuityStatus: ContinuityStatus;
  supportStatus: SupportStatus;
  hazardStatus: HazardStatus;
  maturityStatus: MaturityStatus;
  connectionHonorable: boolean;
  proofRequired: boolean;
  timestamp: string;
  deterministicReplayKey: string;
};

export type RuntimeClosureSnapshot = {
  snapshotId: string;
  proposal: ProposalContext;
  truth: RuntimeTruthInput;
  envelope: ClosureDecisionEnvelope;
  createdAt: string;
};
