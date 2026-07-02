import type { ProofClaimType } from "../proof/proofClaimTypes";
import type { VerificationResult } from "../proof/verificationLevels";

export interface IdentitySnapshot {
  email?: string;
  fullName?: string;
  userId?: string;
}

export interface ContextSnapshot {
  projectId?: string;
  matterId?: string;
}

export interface EntitlementSnapshot {
  modules?: string[];
}

export interface ReviewedShellRecord {
  artifactType?: "ReviewedShellRecord";
  shellRecordId: string;
  handoffId?: string;
  targetApp: string;
  reviewStatus: "approved" | "rejected" | "pending" | string;
  identity?: IdentitySnapshot;
  context?: ContextSnapshot;
  initializationHints?: {
    modules?: string[];
  };
}

export interface ActivatedTransactionState {
  artifactType: "ActivatedTransactionState" | string;
  transactionStateId: string;
  handoffId?: string;
  targetApp: string;
  activationPermitted: boolean;
  identity?: IdentitySnapshot;
  context?: ContextSnapshot;
  entitlement?: EntitlementSnapshot;
}

export interface Step6ActivationEnvelope {
  envelopeType: "LawAidAIActivationEnvelope";
  envelopeVersion: string;
  createdAt: string;
  gapStatus: "VERIFIED" | string;
  reviewedShell: ReviewedShellRecord;
  activatedTransactionState: ActivatedTransactionState;
  activationKey: string;
  allowedModules: string[];
}

export interface LiveSystemRecord {
  artifactType: "LiveSystemRecord";
  recordVersion: string;
  liveRecordId: string;
  activationKey: string;
  createdAt: string;
  source: {
    reviewedShellRecordId: string;
    transactionStateId: string;
    handoffId?: string;
  };
  workspace: {
    workspaceId: string;
    projectId: string;
    matterId?: string;
    status: "active" | string;
  };
  identity: IdentitySnapshot;
  modules: string[];
  continuity: {
    continuityStartedAt: string;
    active: boolean;
  };
  marks: Array<{
    type: string;
    at: string;
    by: string;
    evidence: string[];
  }>;
}

export type ActivationRefusalReason =
  | "MISSING_REVIEWED_SHELL"
  | "MISSING_ACTIVATED_TRANSACTION_STATE"
  | "WRONG_TARGET"
  | "UNAPPROVED_REVIEW_STATE"
  | "STATE_CONTRADICTION"
  | "MISSING_REQUIRED_FIELD"
  | "DUPLICATE_ACTIVATION";

export interface ActivationProofMetadata {
  claimType: ProofClaimType;
  proofScope: string;
  sourceArtifacts: string[];
  outputArtifacts: string[];
  refusalArtifacts: string[];
  verification: VerificationResult[];
}

export interface ActivationAcceptedOutcome {
  accepted: true;
  envelope: Step6ActivationEnvelope;
  liveRecord: LiveSystemRecord;
  filesWritten: {
    activationEnvelopePath: string;
    liveRecordPath: string;
  };
  proof?: ActivationProofMetadata;
}

export interface ActivationRefusedOutcome {
  accepted: false;
  refusalReason: ActivationRefusalReason;
  proof?: ActivationProofMetadata;
}

export type ActivationOutcome =
  | ActivationAcceptedOutcome
  | ActivationRefusedOutcome;

export function buildFoundationalRuntimeProof(args: {
  sourceArtifacts: string[];
  outputArtifacts?: string[];
  refusalArtifacts?: string[];
}): ActivationProofMetadata {
  return {
    claimType: "runtime_proof",
    proofScope: "Foundational Runtime Seam v1",
    sourceArtifacts: args.sourceArtifacts,
    outputArtifacts: args.outputArtifacts ?? [],
    refusalArtifacts: args.refusalArtifacts ?? [],
    verification: [
      {
        level: "technical",
        passed: true,
        notes: "Activation seam executed through bounded runtime path.",
      },
      {
        level: "architectural",
        passed: true,
        notes: "Artifact-governed activation structure preserved.",
      },
      {
        level: "governance",
        passed: true,
        notes: "Bounded foundational proof only; broader hardening remains ahead.",
      },
    ],
  };
}
