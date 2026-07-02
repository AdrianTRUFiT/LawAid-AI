import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { createDefaultDisclosurePolicy, issueComplianceTrustAttestation, releaseComplianceTrustInstruction } from "../src/index.js";

const actor: ActorIdentity = {
  actorId: "compliance-operator",
  role: "operator",
  scope: ["compliance"],
  keyId: "compliance-key-001",
};

const attestPolicy: PolicySnapshot = {
  policyId: "compliance-attest-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ComplianceEligibilityAttestation"],
  allowedScopes: ["compliance"],
};

const releasePolicy: PolicySnapshot = {
  policyId: "compliance-release-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ComplianceReleaseArtifact"],
  allowedScopes: ["compliance"],
};

const attested = issueComplianceTrustAttestation({
  request: {
    requestId: "ctr_release_001",
    subject: {
      subjectId: "subject_005",
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
    nonce: "nonce_release",
    validFrom: new Date(Date.now() - 60_000).toISOString(),
    validUntil: new Date(Date.now() + 60_000).toISOString(),
    usageLimit: 1,
    requestedAt: new Date().toISOString(),
  },
  actor,
  trustPolicy: attestPolicy,
});

const release = releaseComplianceTrustInstruction({
  trustedResult: attested,
  actor,
  trustPolicy: releasePolicy,
  releaseConditionMet: true,
});

if (!release.released || release.decision !== "ATTESTED" || !release.release) {
  throw new Error(`Expected release success but received ${release.decision}`);
}

console.log("SMOKE_COMPLIANCE_TRUST_RELEASE=PASS");