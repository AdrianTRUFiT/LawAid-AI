import {
  ArtifactTypes,
  ClaimTypes,
  EventTypes,
  SubjectTypes,
  VerificationStatuses,
} from "./grEnums";
import type {
  GovernedRealityRecord,
  GoverningArtifact,
  GoverningClaim,
  GoverningEvent,
  SubjectRecord,
} from "./grTypes";

function isIsoDateTime(value: string): boolean {
  const time = Date.parse(value);
  return Number.isFinite(time);
}

function includesValue<T extends readonly string[]>(allowed: T, value: string): boolean {
  return allowed.includes(value);
}

export function validateSubject(subject: SubjectRecord): string[] {
  const errors: string[] = [];

  if (!subject.id) errors.push("subject.id is required");
  if (!subject.label) errors.push("subject.label is required");
  if (!includesValue(SubjectTypes, subject.type)) {
    errors.push(`subject.type must be one of: ${SubjectTypes.join(", ")}`);
  }

  return errors;
}

export function validateEvent(event: GoverningEvent): string[] {
  const errors: string[] = [];

  if (!event.eventId) errors.push("event.eventId is required");
  if (!includesValue(EventTypes, event.eventType)) {
    errors.push(`event.eventType must be one of: ${EventTypes.join(", ")}`);
  }
  if (!event.actorId) errors.push("event.actorId is required");
  if (!isIsoDateTime(event.occurredAt)) errors.push("event.occurredAt must be ISO datetime");
  if (!isIsoDateTime(event.recordedAt)) errors.push("event.recordedAt must be ISO datetime");
  if (!includesValue(VerificationStatuses, event.verificationStatus)) {
    errors.push(`event.verificationStatus must be one of: ${VerificationStatuses.join(", ")}`);
  }
  if (!Array.isArray(event.artifactIds)) errors.push("event.artifactIds must be an array");

  return errors;
}

export function validateClaim(claim: GoverningClaim): string[] {
  const errors: string[] = [];

  if (!claim.claimId) errors.push("claim.claimId is required");
  if (!includesValue(ClaimTypes, claim.claimType)) {
    errors.push(`claim.claimType must be one of: ${ClaimTypes.join(", ")}`);
  }
  if (!claim.madeBy) errors.push("claim.madeBy is required");
  if (!claim.statement) errors.push("claim.statement is required");
  if (!claim.subjectId) errors.push("claim.subjectId is required");
  if (!isIsoDateTime(claim.madeAt)) errors.push("claim.madeAt must be ISO datetime");
  if (!includesValue(VerificationStatuses, claim.verificationStatus)) {
    errors.push(`claim.verificationStatus must be one of: ${VerificationStatuses.join(", ")}`);
  }

  return errors;
}

export function validateArtifact(artifact: GoverningArtifact): string[] {
  const errors: string[] = [];

  if (!artifact.artifactId) errors.push("artifact.artifactId is required");
  if (!includesValue(ArtifactTypes, artifact.artifactType)) {
    errors.push(`artifact.artifactType must be one of: ${ArtifactTypes.join(", ")}`);
  }
  if (!artifact.createdBy) errors.push("artifact.createdBy is required");
  if (!isIsoDateTime(artifact.createdAt)) errors.push("artifact.createdAt must be ISO datetime");
  if (!["unknown", "untrusted", "trusted"].includes(artifact.authenticityStatus)) {
    errors.push("artifact.authenticityStatus must be unknown, untrusted, or trusted");
  }

  return errors;
}

export function validateGovernedRealityRecord(record: GovernedRealityRecord): string[] {
  const errors: string[] = [];

  if (record.schemaVersion !== "1.0.0") {
    errors.push("record.schemaVersion must be 1.0.0");
  }

  errors.push(...validateSubject(record.subject));

  record.events.forEach((event, index) => {
    errors.push(...validateEvent(event).map((e) => `events[${index}].${e}`));
  });

  record.claims.forEach((claim, index) => {
    errors.push(...validateClaim(claim).map((e) => `claims[${index}].${e}`));
  });

  record.artifacts.forEach((artifact, index) => {
    errors.push(...validateArtifact(artifact).map((e) => `artifacts[${index}].${e}`));
  });

  return errors;
}
