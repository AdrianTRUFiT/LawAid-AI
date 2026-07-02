import type {
  AppendArtifactInput,
  AppendClaimInput,
  AppendEventInput,
  ConsequenceRecord,
  CreateRecordInput,
  GovernedRealityRecord,
  RecomputeOptions,
  VerificationRecord,
} from "./grTypes";
import {
  validateArtifact,
  validateClaim,
  validateEvent,
  validateGovernedRealityRecord,
} from "./grValidators";

function nowIso(): string {
  return new Date().toISOString();
}

function impactFromCount(count: number): ConsequenceRecord["customerImpact"] {
  if (count <= 0) return "none";
  if (count === 1) return "low";
  if (count === 2) return "medium";
  if (count === 3) return "high";
  return "critical";
}

export function createGovernedRealityRecord(input: CreateRecordInput): GovernedRealityRecord {
  return {
    schemaVersion: "1.0.0",
    recordId: input.recordId,
    subject: input.subject,
    events: [],
    claims: [],
    artifacts: [],
    verification: {
      subjectId: input.subject.id,
      currentTrustState: "unverified",
      verifiedEventIds: [],
      supportedClaimIds: [],
      contradictedClaimIds: [],
      openDisputeIds: [],
    },
    consequence: {
      customerImpact: "none",
      paymentImpact: "none",
      reputationImpact: "none",
    },
  };
}

export function appendEvent(
  record: GovernedRealityRecord,
  input: AppendEventInput
): GovernedRealityRecord {
  const event = {
    ...input,
    artifactIds: input.artifactIds ?? [],
  };

  const errors = validateEvent(event);
  if (errors.length) {
    throw new Error(`Invalid event: ${errors.join("; ")}`);
  }

  return {
    ...record,
    events: [...record.events, event],
  };
}

export function appendClaim(
  record: GovernedRealityRecord,
  input: AppendClaimInput
): GovernedRealityRecord {
  const errors = validateClaim(input);
  if (errors.length) {
    throw new Error(`Invalid claim: ${errors.join("; ")}`);
  }

  return {
    ...record,
    claims: [...record.claims, input],
  };
}

export function appendArtifact(
  record: GovernedRealityRecord,
  input: AppendArtifactInput
): GovernedRealityRecord {
  const errors = validateArtifact(input);
  if (errors.length) {
    throw new Error(`Invalid artifact: ${errors.join("; ")}`);
  }

  return {
    ...record,
    artifacts: [...record.artifacts, input],
  };
}

export function recomputeVerification(
  record: GovernedRealityRecord,
  options: RecomputeOptions = {}
): GovernedRealityRecord {
  const verifiedEventIds = record.events
    .filter((event) => event.verificationStatus === "verified")
    .map((event) => event.eventId);

  const supportedClaimIds = record.claims
    .filter((claim) => claim.verificationStatus === "supported" || claim.verificationStatus === "verified")
    .map((claim) => claim.claimId);

  const contradictedClaimIds = record.claims
    .filter((claim) => claim.verificationStatus === "contradicted" || claim.verificationStatus === "refused")
    .map((claim) => claim.claimId);

  const openDisputeIds = record.claims
    .filter((claim) => claim.claimType === "dispute" && claim.verificationStatus !== "refused")
    .map((claim) => claim.claimId);

  let currentTrustState: VerificationRecord["currentTrustState"] = "unverified";

  if (contradictedClaimIds.length > 0) {
    currentTrustState = "refused";
  } else if (openDisputeIds.length > 0) {
    currentTrustState = "disputed";
  } else if (verifiedEventIds.length > 0 && supportedClaimIds.length > 0) {
    currentTrustState = "verified";
  } else if (verifiedEventIds.length > 0 || supportedClaimIds.length > 0) {
    currentTrustState = "partially_verified";
  }

  const consequence = deriveConsequence(record, {
    dependencyState: options.dependencyState,
    nextRequiredAction: options.nextRequiredAction,
  });

  const nextRecord: GovernedRealityRecord = {
    ...record,
    verification: {
      subjectId: record.subject.id,
      currentTrustState,
      lastVerifiedAt: nowIso(),
      verifiedEventIds,
      supportedClaimIds,
      contradictedClaimIds,
      openDisputeIds,
    },
    consequence,
  };

  const errors = validateGovernedRealityRecord(nextRecord);
  if (errors.length) {
    throw new Error(`Invalid Verified Timeline record after recompute: ${errors.join("; ")}`);
  }

  return nextRecord;
}

export function deriveConsequence(
  record: GovernedRealityRecord,
  options: RecomputeOptions = {}
): ConsequenceRecord {
  const disputeCount = record.claims.filter((claim) => claim.claimType === "dispute").length;
  const dependencyCount = record.claims.filter((claim) => claim.claimType === "dependency").length;
  const proofRequestCount = record.claims.filter((claim) => claim.claimType === "proof_request").length;

  return {
    dependencyState: options.dependencyState ?? (dependencyCount > 0 ? "dependency_present" : "no_active_dependency"),
    customerImpact: impactFromCount(disputeCount),
    paymentImpact: impactFromCount(proofRequestCount + dependencyCount),
    reputationImpact: impactFromCount(disputeCount + proofRequestCount),
    nextRequiredAction: options.nextRequiredAction ?? (proofRequestCount > 0 ? "resolve outstanding proof request" : undefined),
  };
}

