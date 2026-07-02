export type WfcEnvelopeStatus =
  | "created"
  | "in_motion"
  | "delivered"
  | "held"
  | "refused"
  | "failed";

export type MiStampType =
  | "intake"
  | "handoff"
  | "route_check"
  | "condition_check"
  | "signature_check"
  | "registry_lookup"
  | "impact_check"
  | "release_check"
  | "failure_check"
  | "receipt";

export type VerificationStatus =
  | "verified"
  | "not_verified"
  | "held_for_review"
  | "refused";

export type ConsequenceState =
  | "allowed"
  | "blocked"
  | "held"
  | "refused";

export type WfcParty = {
  id: string;
  role: "client" | "studio" | "financial_institution" | "registry" | "system" | "receiver";
  displayName: string;
};

export type WfcEnvelope = {
  envelopeId: string;
  recordId: string;
  transactionId: string;
  currentHolder: string;
  intendedReceiver: string;
  status: WfcEnvelopeStatus;
  payloadReference: string;
  createdAt: string;
  updatedAt: string;
};

export type MiStamp = {
  stampId: string;
  envelopeId: string;
  type: MiStampType;
  checkpointId: string;
  from?: string;
  to?: string;
  status: VerificationStatus;
  note: string;
  artifactRef?: string;
  timestamp: string;
};

export type SoulRegistryLookupRequest = {
  lookupId: string;
  envelopeId: string;
  question: "was_signed_for" | "can_release" | "where_truth_broke" | "impact_radius";
};

export type SoulRegistryLookupResult = {
  lookupId: string;
  envelopeId: string;
  status: VerificationStatus;
  signedArtifact?: string;
  signerIdentity?: string;
  signerAuthority?: VerificationStatus;
  timestamp?: string;
  custodyRouteVerified: boolean;
  miStampVerified: boolean;
  releaseAuthorized: boolean;
  reason: string;
};

export type ImpactRadius = {
  allowed: string[];
  blocked: string[];
  delayed: string[];
  atRisk: string[];
  affectedParties: string[];
};

export type FailureInvestigation = {
  investigationId: string;
  envelopeId: string;
  status: "no_failure_detected" | "failure_detected";
  failurePoint?: string;
  failureCode?: string;
  whatWasSupposedToHappen: string;
  whatActuallyHappened: string;
  proofBreak?: string;
  movedAnyway?: boolean;
  checkpointThatShouldHaveStoppedIt?: string;
  consequenceState: ConsequenceState;
};

export type Soul256Projection = {
  totalCheckpoints: 256;
  yesCount: number;
  noCount: number;
  requiredNoCount: number;
  verified: boolean;
  status: VerificationStatus;
  blockedCheckpoint?: string;
  consequenceState: ConsequenceState;
};

export type MovementIntelligenceSnapshot = {
  envelope: WfcEnvelope;
  stamps: MiStamp[];
  registryLookup: SoulRegistryLookupResult;
  impactRadius: ImpactRadius;
  failureInvestigation: FailureInvestigation;
  soul256Projection: Soul256Projection;
  boundary: {
    wfcCreatesTruth: false;
    miCreatesTruth: false;
    registryCreatesTruth: false;
    fundTrackerAIRemainsTruthAuthority: true;
    displayIsAuthority: false;
    transportIsTruth: false;
  };
};
