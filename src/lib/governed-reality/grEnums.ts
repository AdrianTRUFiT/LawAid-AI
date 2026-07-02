export const SubjectTypes = [
  "contract",
  "payment",
  "task",
  "project",
  "inventory_unit",
  "document",
  "shipment",
  "issue",
  "appointment",
  "message",
  "custom"
] as const;

export const EventTypes = [
  "created",
  "updated",
  "assigned",
  "moved",
  "changed_state",
  "delivered",
  "received",
  "acknowledged",
  "attached",
  "transferred",
  "custom"
] as const;

export const ClaimTypes = [
  "statement",
  "expectation",
  "dependency",
  "dispute",
  "proof_request",
  "custom"
] as const;

export const ArtifactTypes = [
  "document",
  "signature",
  "scan_record",
  "system_log",
  "email",
  "photo",
  "hash_record",
  "witness_statement",
  "custom"
] as const;

export const VerificationStatuses = [
  "pending",
  "supported",
  "verified",
  "contradicted",
  "refused",
  "unresolved"
] as const;

export const TrustStates = [
  "unverified",
  "partially_verified",
  "verified",
  "disputed",
  "refused"
] as const;

export const ImpactLevels = [
  "none",
  "low",
  "medium",
  "high",
  "critical"
] as const;

export type SubjectType = (typeof SubjectTypes)[number];
export type EventType = (typeof EventTypes)[number];
export type ClaimType = (typeof ClaimTypes)[number];
export type ArtifactType = (typeof ArtifactTypes)[number];
export type VerificationStatus = (typeof VerificationStatuses)[number];
export type TrustState = (typeof TrustStates)[number];
export type ImpactLevel = (typeof ImpactLevels)[number];
