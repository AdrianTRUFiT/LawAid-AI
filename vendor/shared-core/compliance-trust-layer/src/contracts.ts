export type ComplianceTrustDecision =
  | "ATTESTED"
  | "REFUSED_MALFORMED"
  | "REFUSED_POLICY"
  | "REFUSED_EXPIRED"
  | "REFUSED_REPLAY"
  | "REFUSED_UNAUTHORIZED"
  | "REFUSED_TAMPERED"
  | "REFUSED_QUARANTINED";

export type ComplianceTrustArtifactType =
  | "ComplianceEligibilityAttestation"
  | "ComplianceInstructionArtifact"
  | "ComplianceReleaseArtifact"
  | "ComplianceAuditArtifact";

export interface ComplianceSubject {
  subjectId: string;
  subjectType: "person" | "organization" | "account" | "workflow" | "shipment" | "generic";
  jurisdictionCode: string;
}

export interface ComplianceClaim {
  claimId: string;
  claimType: string;
  status: "eligible" | "ineligible" | "restricted" | "review_required";
  evidenceRef?: string;
  note?: string;
}

export interface DisclosurePolicy {
  policyId: string;
  minimumDisclosureFields: string[];
  requiredClaims: string[];
  allowExpiredUse: boolean;
  releaseMode: "single_use" | "time_window" | "until_revoked";
}

export interface ComplianceTrustRequest {
  requestId: string;
  subject: ComplianceSubject;
  claims: ComplianceClaim[];
  policy: DisclosurePolicy;
  requestedArtifactType: ComplianceTrustArtifactType;
  nonce: string;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  requestedAt: string;
  metadata?: Record<string, unknown>;
}

export interface ComplianceTrustAttestation {
  attestationId: string;
  requestId: string;
  subjectId: string;
  artifactType: ComplianceTrustArtifactType;
  jurisdictionCode: string;
  disclosedFields: Record<string, unknown>;
  claimSummary: Array<{
    claimId: string;
    claimType: string;
    status: ComplianceClaim["status"];
  }>;
  nonce: string;
  validFrom: string;
  validUntil: string;
  remainingUses: number;
  issuedAt: string;
  complianceStatus: "attested";
}

export interface ComplianceInstruction {
  instructionId: string;
  attestationId: string;
  targetAction: string;
  nonce: string;
  validFrom: string;
  validUntil: string;
  singleUse: boolean;
  issuedAt: string;
  instructionStatus: "ready";
}

export interface ComplianceReleaseRecord {
  releaseId: string;
  attestationId: string;
  instructionId: string;
  releasedAt: string;
  releaseStatus: "released";
  releaseConditionMet: boolean;
}

export interface ComplianceAuditRecord {
  auditId: string;
  requestId: string;
  attestationId?: string;
  instructionId?: string;
  releaseId?: string;
  decision: ComplianceTrustDecision;
  reason: string;
  createdAt: string;
}

export interface ComplianceTrustResult {
  trusted: boolean;
  decision: ComplianceTrustDecision;
  reason: string;
  attestation: ComplianceTrustAttestation | null;
  instruction: ComplianceInstruction | null;
  audit: ComplianceAuditRecord;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}

export interface ComplianceReleaseResult {
  released: boolean;
  decision: ComplianceTrustDecision;
  reason: string;
  release: ComplianceReleaseRecord | null;
  audit: ComplianceAuditRecord;
  trustedEnvelopeId?: string;
  authorizationDecision?: string;
  registryValid?: boolean;
}