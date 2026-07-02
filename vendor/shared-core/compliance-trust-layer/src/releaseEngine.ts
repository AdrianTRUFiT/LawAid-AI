import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  ComplianceAuditRecord,
  ComplianceReleaseRecord,
  ComplianceReleaseResult,
  ComplianceTrustResult,
} from "./contracts.js";
import { validateTimeWindow } from "./validators.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function buildAudit(input: {
  requestId: string;
  decision: ComplianceReleaseResult["decision"];
  reason: string;
  attestationId?: string;
  instructionId?: string;
  releaseId?: string;
}): ComplianceAuditRecord {
  return {
    auditId: makeId("audit"),
    requestId: input.requestId,
    attestationId: input.attestationId,
    instructionId: input.instructionId,
    releaseId: input.releaseId,
    decision: input.decision,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  };
}

export function releaseComplianceTrustInstruction(input: {
  trustedResult: ComplianceTrustResult;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
  releaseConditionMet: boolean;
  trustController?: TrustSpineController;
  now?: Date;
}): ComplianceReleaseResult {
  const attestation = input.trustedResult.attestation;
  const instruction = input.trustedResult.instruction;

  if (!input.trustedResult.trusted || !attestation || !instruction) {
    const audit = buildAudit({
      requestId: attestation?.requestId ?? "unknown",
      decision: "REFUSED_UNAUTHORIZED",
      reason: "Trusted attestation and instruction are required before release.",
      attestationId: attestation?.attestationId,
      instructionId: instruction?.instructionId,
    });

    return {
      released: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: input.trustedResult.trustedEnvelopeId,
      authorizationDecision: input.trustedResult.authorizationDecision,
      registryValid: input.trustedResult.registryValid,
    };
  }

  const timeCheck = validateTimeWindow({
    validFrom: instruction.validFrom,
    validUntil: instruction.validUntil,
    allowExpiredUse: false,
    now: input.now,
  });

  if (!timeCheck.ok) {
    const audit = buildAudit({
      requestId: attestation.requestId,
      decision: "REFUSED_EXPIRED",
      reason: timeCheck.reason,
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      released: false,
      decision: "REFUSED_EXPIRED",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: input.trustedResult.trustedEnvelopeId,
      authorizationDecision: input.trustedResult.authorizationDecision,
      registryValid: input.trustedResult.registryValid,
    };
  }

  if (!input.releaseConditionMet) {
    const audit = buildAudit({
      requestId: attestation.requestId,
      decision: "REFUSED_POLICY",
      reason: "Release condition was not met.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      released: false,
      decision: "REFUSED_POLICY",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: input.trustedResult.trustedEnvelopeId,
      authorizationDecision: input.trustedResult.authorizationDecision,
      registryValid: input.trustedResult.registryValid,
    };
  }

  if (instruction.singleUse && attestation.remainingUses < 1) {
    const audit = buildAudit({
      requestId: attestation.requestId,
      decision: "REFUSED_REPLAY",
      reason: "Instruction has no remaining uses.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
    });

    return {
      released: false,
      decision: "REFUSED_REPLAY",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: input.trustedResult.trustedEnvelopeId,
      authorizationDecision: input.trustedResult.authorizationDecision,
      registryValid: input.trustedResult.registryValid,
    };
  }

  const release: ComplianceReleaseRecord = {
    releaseId: makeId("release"),
    attestationId: attestation.attestationId,
    instructionId: instruction.instructionId,
    releasedAt: new Date().toISOString(),
    releaseStatus: "released",
    releaseConditionMet: true,
  };

  const trustController = input.trustController ?? new TrustSpineController();

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.trustPolicy,
    request: {
      action: "release_compliance_instruction",
      artifactType: "ComplianceReleaseArtifact",
      scope: "compliance",
      justification: "Lawful compliance trust release.",
    },
    payload: release,
    parentArtifactIds: input.trustedResult.trustedEnvelopeId
      ? [input.trustedResult.trustedEnvelopeId]
      : [],
  });

  if (trusted.receipt.decision !== "approved") {
    const audit = buildAudit({
      requestId: attestation.requestId,
      decision: "REFUSED_UNAUTHORIZED",
      reason: `Authorization decision was ${trusted.receipt.decision}.`,
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
      releaseId: release.releaseId,
    });

    return {
      released: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: audit.reason,
      release: null,
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
      requestId: attestation.requestId,
      decision: "REFUSED_TAMPERED",
      reason: "Release artifact failed integrity verification.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
      releaseId: release.releaseId,
    });

    return {
      released: false,
      decision: "REFUSED_TAMPERED",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  if (!snapshot.canPropagate) {
    const audit = buildAudit({
      requestId: attestation.requestId,
      decision: "REFUSED_QUARANTINED",
      reason: "Release artifact cannot propagate.",
      attestationId: attestation.attestationId,
      instructionId: instruction.instructionId,
      releaseId: release.releaseId,
    });

    return {
      released: false,
      decision: "REFUSED_QUARANTINED",
      reason: audit.reason,
      release: null,
      audit,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  const audit = buildAudit({
    requestId: attestation.requestId,
    decision: "ATTESTED",
    reason: "Compliance trust release completed.",
    attestationId: attestation.attestationId,
    instructionId: instruction.instructionId,
    releaseId: release.releaseId,
  });

  return {
    released: true,
    decision: "ATTESTED",
    reason: audit.reason,
    release,
    audit,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}