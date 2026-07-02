import {
  createGovernedRealityRecord,
  appendArtifact,
  appendClaim,
  appendEvent,
  recomputeVerification,
} from "../../lib/governed-reality";

let record = createGovernedRealityRecord({
  recordId: "rec_contract_123",
  subject: {
    id: "contract_123",
    type: "contract",
    label: "Signed Vendor Agreement",
    ownerOrgId: "org_001",
  },
});

record = appendArtifact(record, {
  artifactId: "art_001",
  artifactType: "signature",
  createdAt: "2026-04-12T14:30:10Z",
  createdBy: "system_scanner_01",
  storageRef: "vault://contracts/123/signature.json",
  hash: "sha256:abc123",
  authenticityStatus: "trusted",
  linkedEventId: "evt_001",
});

record = appendEvent(record, {
  eventId: "evt_001",
  eventType: "delivered",
  occurredAt: "2026-04-12T14:30:00Z",
  recordedAt: "2026-04-12T14:31:00Z",
  actorId: "courier_77",
  statement: "Delivered signed contract to secure intake.",
  stateBefore: "in_transit",
  stateAfter: "received",
  artifactIds: ["art_001"],
  verificationStatus: "verified",
});

record = appendClaim(record, {
  claimId: "clm_001",
  claimType: "dependency",
  madeBy: "finance_team",
  madeAt: "2026-04-12T14:32:00Z",
  statement: "Payment release depends on receipt of this contract.",
  subjectId: "contract_123",
  relatedEventId: "evt_001",
  verificationStatus: "supported",
});

record = appendClaim(record, {
  claimId: "clm_002",
  claimType: "dispute",
  madeBy: "person_z",
  madeAt: "2026-04-12T15:05:00Z",
  statement: "The handover timing may be incorrect.",
  subjectId: "contract_123",
  verificationStatus: "pending",
});

record = recomputeVerification(record, {
  dependencyState: "payment_blocked_until_verified",
  nextRequiredAction: "resolve handover timing dispute",
});

export const demoGovernedRealityRecord = record;
