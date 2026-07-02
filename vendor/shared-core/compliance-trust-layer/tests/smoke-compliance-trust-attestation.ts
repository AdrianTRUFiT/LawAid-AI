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

const result = issueComplianceTrustAttestation({
  request: {
    requestId: "ctr_001",
    subject: {
      subjectId: "subject_001",
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
    nonce: "nonce_001",
    validFrom: new Date(Date.now() - 60_000).toISOString(),
    validUntil: new Date(Date.now() + 60_000).toISOString(),
    usageLimit: 1,
    requestedAt: new Date().toISOString(),
  },
  actor,
  trustPolicy,
  nonceStore,
});

if (!result.trusted || result.decision !== "ATTESTED" || !result.attestation || !result.instruction) {
  throw new Error(`Expected ATTESTED but received ${result.decision}`);
}

console.log("SMOKE_COMPLIANCE_TRUST_ATTESTATION=PASS");