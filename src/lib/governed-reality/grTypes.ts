import type {
  ArtifactType,
  ClaimType,
  EventType,
  ImpactLevel,
  SubjectType,
  TrustState,
  VerificationStatus,
} from "./grEnums";

export interface SubjectRecord {
  id: string;
  type: SubjectType;
  label: string;
  ownerOrgId?: string;
  metadata?: Record<string, unknown>;
}

export interface GoverningEvent {
  eventId: string;
  eventType: EventType;
  occurredAt: string;
  recordedAt: string;
  actorId: string;
  statement?: string;
  stateBefore?: string;
  stateAfter?: string;
  locationBeforeId?: string;
  locationAfterId?: string;
  artifactIds: string[];
  verificationStatus: VerificationStatus;
  metadata?: Record<string, unknown>;
}

export interface GoverningClaim {
  claimId: string;
  claimType: ClaimType;
  madeBy: string;
  madeAt: string;
  statement: string;
  subjectId: string;
  relatedEventId?: string;
  verificationStatus: VerificationStatus;
  metadata?: Record<string, unknown>;
}

export interface GoverningArtifact {
  artifactId: string;
  artifactType: ArtifactType;
  createdAt: string;
  createdBy: string;
  storageRef?: string;
  hash?: string;
  authenticityStatus: "unknown" | "untrusted" | "trusted";
  linkedEventId?: string;
  linkedClaimId?: string;
  metadata?: Record<string, unknown>;
}

export interface VerificationRecord {
  subjectId: string;
  currentTrustState: TrustState;
  lastVerifiedAt?: string;
  verifiedEventIds: string[];
  supportedClaimIds: string[];
  contradictedClaimIds: string[];
  openDisputeIds: string[];
  notes?: string;
}

export interface ConsequenceRecord {
  dependencyState?: string;
  customerImpact: ImpactLevel;
  paymentImpact: ImpactLevel;
  reputationImpact: ImpactLevel;
  nextRequiredAction?: string;
  notes?: string;
}

export interface GovernedRealityRecord {
  schemaVersion: "1.0.0";
  recordId: string;
  subject: SubjectRecord;
  events: GoverningEvent[];
  claims: GoverningClaim[];
  artifacts: GoverningArtifact[];
  verification: VerificationRecord;
  consequence: ConsequenceRecord;
}

export interface CreateRecordInput {
  recordId: string;
  subject: SubjectRecord;
}

export interface AppendEventInput extends Omit<GoverningEvent, "artifactIds"> {
  artifactIds?: string[];
}

export interface AppendClaimInput extends GoverningClaim {}

export interface AppendArtifactInput extends GoverningArtifact {}

export interface RecomputeOptions {
  dependencyState?: string;
  nextRequiredAction?: string;
}
