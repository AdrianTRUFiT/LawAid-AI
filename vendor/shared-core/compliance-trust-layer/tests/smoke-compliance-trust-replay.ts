import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { createDefaultDisclosurePolicy, ComplianceNonceStore, issueComplianceTrustAttestation } from "../src/index.js";

const actor: ActorIdentity = {
  actorId: "compliance-operator",
  role: "operator",
  scope: ["compliance"],
  keyId: "compliance-key-001",
};

const trustPolicy: PolicySnapshot = {
  policyId: "compliance-trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ComplianceEligibilityAttestation"],
  allowedScopes: ["compliance"],
};

const nonceStore = new ComplianceNonceStore();

issueComplianceTrustAttestation({
  request: {
    requestId: "ctr_replay_001",
    subject: {
      subjectId: "subject_002",
      subjectType: "workflow",
      jurisdictionCode: "US",
    },
    claims: [
      {
        claimId: "claim_001",
        claimType: "base_eligibility",
        status: "eligible",
      },
    ],
    policy: createDefaultDisclosurePolicy(),
    requestedArtifactType: "ComplianceEligibilityAttestation",
    nonce: "nonce_replay",
    validFrom: new Date(Date.now() - 60_000).toISOString(),
    validUntil: new Date(Date.now() + 60_000).toISOString(),
    usageLimit: 1,
    requestedAt: new Date().toISOString(),
  },
  actor,
  trustPolicy,
  nonceStore,
});

const replay = issueComplianceTrustAttestation({
  request: {
    requestId: "ctr_replay_002",
    subject: {
      subjectId: "subject_003",
      subjectType: "workflow",
      jurisdictionCode: "US",
    },
    claims: [
      {
        claimId: "claim_001",
        claimType: "base_eligibility",
        status: "eligible",
      },
    ],
    policy: createDefaultDisclosurePolicy(),
    requestedArtifactType: "ComplianceEligibilityAttestation",
    nonce: "nonce_replay",
    validFrom: new Date(Date.now() - 60_000).toISOString(),
    validUntil: new Date(Date.now() + 60_000).toISOString(),
    usageLimit: 1,
    requestedAt: new Date().toISOString(),
  },
  actor,
  trustPolicy,
  nonceStore,
});

if (replay.trusted || replay.decision !== "REFUSED_REPLAY") {
  throw new Error(`Expected REFUSED_REPLAY but received ${replay.decision}`);
}

console.log("SMOKE_COMPLIANCE_TRUST_REPLAY=PASS");