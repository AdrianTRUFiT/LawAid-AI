export type Soul256CheckpointStatus = "pending" | "passed" | "failed" | "blocked";

export type Soul256GateKind =
  | "assignment_gate"
  | "real_gate"
  | "decoy_gate"
  | "sink_gate"
  | "reconciliation_gate"
  | "consequence_gate";

export interface Soul256CheckpointDefinition {
  checkpointId: string;
  sequence: number;
  name: string;
  kind: Soul256GateKind;
  required: boolean;
  intelligenceDepth: "light" | "standard" | "deep";
  dependsOn: string[];
  blocksDownstream: boolean;
  consequenceBearing: boolean;
  decoyOnly: boolean;
}

export interface Soul256Assignment {
  assignmentId: string;
  carrierId: string;
  routeId: string;
  issuedAt: string;
}

export interface Soul256CheckpointState {
  checkpointId: string;
  status: Soul256CheckpointStatus;
  reasonCode?: string;
  verifiedAt?: string;
  artifactId?: string;
}

export interface Soul256Artifact {
  artifactId: string;
  type:
    | "entry_artifact"
    | "assignment_artifact"
    | "checkpoint_artifact"
    | "refusal_artifact"
    | "reconciliation_artifact"
    | "consequence_artifact"
    | "decoy_artifact"
    | "sink_artifact";
  checkpointId?: string;
  recordedAt: string;
  payloadHash: string;
}

export interface Soul256Session {
  sessionId: string;
  identityId: string;
  environmentId: string;
  issuedAt: string;
  assignment: Soul256Assignment;
  checkpoints: Soul256CheckpointState[];
  artifacts: Soul256Artifact[];
  realCarrierId: string;
  realRouteId: string;
  decoyCarrierIds: string[];
  decoyRouteIds: string[];
  consequenceUnlocked: boolean;
  consequenceCheckpointId?: string;
  trapped: boolean;
  trapCheckpointId?: string;
  complete: boolean;
}

export interface Soul256AdvanceInput {
  checkpointId: string;
  carrierId: string;
  routeId: string;
  payload?: Record<string, unknown>;
}

export interface Soul256AdvanceResult {
  ok: boolean;
  checkpointId: string;
  status: Soul256CheckpointStatus;
  reasonCode?: string;
  artifactId?: string;
}

export interface Soul256ReconciliationResult {
  ok: boolean;
  reasonCode?: string;
  passedRequired: number;
  totalRequired: number;
  assignmentMatches: boolean;
}
