import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  ComplianceAuditRecord,
  ComplianceInstruction,
  ComplianceTrustAttestation,
  ComplianceTrustRequest,
  ComplianceTrustResult,
} from "./contracts.js";
import { ComplianceNonceStore } from "./nonceStore.js";
import { validateComplianceTrustRequestShape, validatePolicySatisfaction, validateTimeWindow } from "./validators.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function buildAudit(input: {
  requestId: string;
  decision: ComplianceTrustResult["decision"];
  reason: string;
  attestationId?: string;
  instructionId?: string;
}): ComplianceAuditRecord {
  return {
    auditId: makeId("audit"),
    requestId: input.requestId,
    attestationId: input.attestationId,
    instructionId: input.instructionId,
    decision: input.decision,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
}

function buildAttestation(input: {
  request: ComplianceTrustRequest;
}): ComplianceTrustAttestation {
  return {
    attestationId: makeId("attestation"),
    requestId: input.request.requestId,
    subjectId: input.request.subject.subjectId,
    artifactType: input.request.requestedArtifactType,
    jurisdictionCode: input.request.subject.jurisdictionCode,
    disclosedFields: {
      subjectId: input.request.subject.subjectId,
      jurisdictionCode: input.request.subject.jurisdictionCode,
      claimSummary: input.request.claims.map((claim) => ({
        claimId: claim.claimId,
        claimType: claim.claimType,
        status: claim.status,
      })),
    },
    claimSummary: input.request.claims.map((claim) => ({
      claimId: claim.claimId,
      claimType: claim.claimType,
      status: claim.status,
    })),
    nonce: input.request.nonce,
    validFrom: input.request.validFrom,
    validUntil: input.request.validUntil,
    remainingUses: input.request.usageLimit,
    issuedAt: new Date().toISOString(),
    complianceStatus: "attested",
  };
}

function buildInstruction(input: {
  request: ComplianceTrustRequest;
  attestation: ComplianceTrustAttestation;
}): ComplianceInstruction {
  return {
    instructionId: makeId("instruction"),
    attestationId: input.attestation.attestationId,
    targetAction: input.request.requestedArtifactType,
    nonce: input.request.nonce,
    validFrom: input.request.validFrom,
    validUntil: input.request.validUntil,
    singleUse: input.request.policy.releaseMode === "single_use",
    issuedAt: new Date().toISOString(),
    instructionStatus: "ready",
  };
}

export function issueComplianceTrustAttestation(input: {
  request: ComplianceTrustRequest;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
  nonceStore?: ComplianceNonceStore;
  trustController?: TrustSpineController;
  now?: Date;
}): ComplianceTrustResult {
  if (!validateComplianceTrustRequestShape(input.request)) {
    const audit = buildAudit({
      requestId: (input.request as { requestId?: string }).requestId ?? "unknown",
      decision: "REFUSED_MALFORMED",
      reason: "Compliance trust request shape is invalid.",
    });

    return {
      trusted: false,
      decision: "REFUSED_MALFORMED",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
    };
  }

  const nonceStore = input.nonceStore ?? new ComplianceNonceStore();

  if (nonceStore.has(input.request.nonce)) {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_REPLAY",
      reason: "Nonce was already used.",
    });

    return {
      trusted: false,
      decision: "REFUSED_REPLAY",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
    };
  }

  const policyCheck = validatePolicySatisfaction({
    claims: input.request.claims,
    policy: input.request.policy,
  });

  if (!policyCheck.ok) {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_POLICY",
      reason: policyCheck.reason,
    });

    return {
      trusted: false,
      decision: "REFUSED_POLICY",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
    };
  }

  const timeCheck = validateTimeWindow({
    validFrom: input.request.validFrom,
    validUntil: input.request.validUntil,
    allowExpiredUse: input.request.policy.allowExpiredUse,
    now: input.now,
  });

  if (!timeCheck.ok) {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_EXPIRED",
      reason: timeCheck.reason,
    });

    return {
      trusted: false,
      decision: "REFUSED_EXPIRED",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
    };
  }

  const attestation = buildAttestation({
    request: input.request,
  });

  const instruction = buildInstruction({
    request: input.request,
    attestation,
  });

  const trustController = input.trustController ?? new TrustSpineController();

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.trustPolicy,
    request: {
      action: "issue_compliance_attestation",
      artifactType: "ComplianceEligibilityAttestation",
      scope: "compliance",
      justification: "Lawful compliance trust attestation issuance.",
    },
    payload: {
      attestation,
      instruction,
    },
  });

  if (trusted.receipt.decision !== "approved") {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_UNAUTHORIZED",
      reason: `Authorization decision was ${trusted.receipt.decision}.`,
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      trusted: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  const snapshot = trustController.snapshot({
    envelope: trusted.envelope,
    authorizationApproved: true,
  });

  if (snapshot.isTampered) {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_TAMPERED",
      reason: "Compliance trust envelope failed integrity verification.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      trusted: false,
      decision: "REFUSED_TAMPERED",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  if (!snapshot.canPropagate) {
    const audit = buildAudit({
      requestId: input.request.requestId,
      decision: "REFUSED_QUARANTINED",
      reason: "Compliance trust envelope cannot propagate.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      trusted: false,
      decision: "REFUSED_QUARANTINED",
      reason: audit.reason,
      attestation: null,
      instruction: null,
      audit,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  nonceStore.markUsed(input.request.nonce)

  const audit = buildAudit({
    requestId: input.request.requestId,
    decision: "ATTESTED",
    reason: "Compliance trust attestation issued.",
    attestationId: attestation.attestationId,
    instructionId: instruction.instructionId,
  });

  return {
    trusted: true,
    decision: "ATTESTED",
    reason: audit.reason,
    attestation,
    instruction,
    audit,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}