export type TrustState =
  | "draft"
  | "verified"
  | "suspect"
  | "quarantined"
  | "superseded"
  | "repaired";

export type QuarantineState =
  | "none"
  | "observe"
  | "suspect"
  | "quarantined"
  | "blocked";

export type RepairType =
  | "reverify"
  | "rollback"
  | "supersede"
  | "replace";

export type AuthorizationDecision =
  | "approved"
  | "refused"
  | "expired"
  | "out_of_scope";

export interface ActorIdentity {
  actorId: string;
  role: string;
  scope: string[];
  keyId: string;
}

export interface PolicySnapshot {
  policyId: string;
  version: string;
  allowedArtifactTypes: string[];
  allowedScopes: string[];
  expiresAt?: string;
}

export interface AuthorizationRequest {
  action: string;
  artifactType: string;
  scope: string;
  justification?: string;
}

export interface AuthorizationReceipt {
  receiptId: string;
  actorId: string;
  action: string;
  artifactType: string;
  scope: string;
  decision: AuthorizationDecision;
  justification?: string;
  policyId: string;
  policyVersion: string;
  createdAt: string;
  signature: string;
}

export interface ArtifactEnvelope<TPayload = unknown> {
  artifactId: string;
  artifactType: string;
  parentArtifactIds: string[];
  contentHash: string;
  payload: TPayload;
  actorId: string;
  authorizationReceiptId?: string;
  policyVersion?: string;
  scope: string;
  trustState: TrustState;
  quarantineState: QuarantineState;
  createdAt: string;
  repairedFromArtifactId?: string;
  supersedesArtifactId?: string;
  notes?: string[];
}

export interface RegistryEntry {
  entryId: string;
  artifactId: string;
  action:
    | "create"
    | "authorize"
    | "quarantine"
    | "repair"
    | "supersede";
  recordedAt: string;
  hash: string;
  previousHash: string | null;
  details: Record<string, unknown>;
}

export interface RepairRecord {
  repairId: string;
  artifactId: string;
  repairType: RepairType;
  createdAt: string;
  reason: string;
  replacementArtifactId?: string;
  repairedArtifactId?: string;
}

export interface TrustSnapshot {
  artifactId: string;
  contentHash: string;
  trustState: TrustState;
  quarantineState: QuarantineState;
  lineageDepth: number;
  authorizationValid: boolean;
  isTampered: boolean;
  canPropagate: boolean;
}
