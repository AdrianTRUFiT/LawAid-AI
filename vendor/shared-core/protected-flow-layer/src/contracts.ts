export type FlowCheckpointState =
  | "clear"
  | "watch"
  | "swollen"
  | "blocked"
  | "released"
  | "restored";

export type AuthorityChannelState =
  | "healthy"
  | "degraded"
  | "broken"
  | "restored";

export type FlowDecision =
  | "FLOW_HEALTHY"
  | "FLOW_WATCH"
  | "FLOW_SWOLLEN"
  | "FLOW_BLOCKED"
  | "FLOW_RELEASED"
  | "FLOW_RESTORED";

export type FeeEventType =
  | "admission_fee"
  | "validation_fee"
  | "verification_fee"
  | "routing_fee"
  | "monitoring_fee"
  | "intervention_fee"
  | "release_fee"
  | "completion_fee"
  | "continuity_proof_fee";

export interface CheckpointMetrics {
  checkpointId: string;
  checkpointLabel: string;
  waitMinutes: number;
  retryCount: number;
  reopenCount: number;
  manualInterventionCount: number;
  blockedReleaseCount: number;
  downstreamConsequenceCount: number;
  costInflationDelta: number;
  channelDiscontinuityEvents: number;
  recoveryDepth: number;
}

export interface ProtectedChannelSnapshot {
  channelId: string;
  authorityType: string;
  state: AuthorityChannelState;
  continuityScore: number;
  note?: string;
}

export interface FlowHealthSnapshot {
  flowId: string;
  checkpoint: CheckpointMetrics;
  protectedChannels: ProtectedChannelSnapshot[];
  checkpointState: FlowCheckpointState;
  decision: FlowDecision;
  swellingScore: number;
  protectedFlowHealthy: boolean;
  inflammatoryCost: number;
  healthyCost: number;
  generatedAt: string;
}

export interface FeeEvent {
  feeEventId: string;
  flowId: string;
  checkpointId: string;
  feeType: FeeEventType;
  amount: number;
  compensable: boolean;
  rationale: string;
  createdAt: string;
}

export interface RestorationPlan {
  restorationId: string;
  flowId: string;
  checkpointId: string;
  requiredActions: string[];
  releaseReady: boolean;
  restoreReady: boolean;
  createdAt: string;
}

export interface ProtectedFlowResult {
  snapshot: FlowHealthSnapshot;
  feeEvents: FeeEvent[];
  restorationPlan: RestorationPlan | null;
}