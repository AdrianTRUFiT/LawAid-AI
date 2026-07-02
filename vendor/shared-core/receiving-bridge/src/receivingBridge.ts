import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  ActivatedTransactionStateRecord,
} from "../../fundtracker-bridge/src/index.js";
import { createDefaultReceivingPolicy } from "./receivingPolicy.js";
import type {
  LiveSystemRecord,
  ReceivingPolicy,
  ReceivingResult,
  TrustedActivationResult,
} from "./contracts.js";
import { validateTrustedActivationForReceiving } from "./validators.js";

function makeLiveRecordId(): string {
  return `live-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createLiveSystemRecord(input: {
  activationRecord: ActivatedTransactionStateRecord;
  receivingEnvironment?: string;
}): LiveSystemRecord {
  return {
    liveRecordId: makeLiveRecordId(),
    sourceActivationId: input.activationRecord.activationId,
    receivingEnvironment: input.receivingEnvironment ?? "generic-receiving-environment",
    walletId: input.activationRecord.walletId,
    ownerId: input.activationRecord.ownerId,
    merchantId: input.activationRecord.merchantId,
    jurisdictionCode: input.activationRecord.jurisdictionCode,
    settlementCurrency: input.activationRecord.settlementCurrency,
    settlementAmount: input.activationRecord.settlementAmount,
    displayCurrency: input.activationRecord.displayCurrency,
    displayAmount: input.activationRecord.displayAmount,
    realValueUnits: input.activationRecord.realValueUnits,
    complianceSnapshot: input.activationRecord.complianceSnapshot,
    recordStatus: "live",
    occurredAt: new Date().toISOString(),
  };
}

export function receiveTrustedActivation(input: {
  wrapped: TrustedActivationResult;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
  trustController?: TrustSpineController;
  receivingPolicy?: ReceivingPolicy;
}): ReceivingResult {
  const receivingPolicy =
    input.receivingPolicy ?? createDefaultReceivingPolicy();

  const validation = validateTrustedActivationForReceiving({
    wrapped: input.wrapped,
    policy: receivingPolicy,
  });

  if (!validation.ok) {
    return {
      received: false,
      decision:
        input.wrapped.decision === "REFUSED_TAMPERED"
          ? "REFUSED_TAMPERED"
          : input.wrapped.decision === "REFUSED_QUARANTINED"
          ? "REFUSED_QUARANTINED"
          : input.wrapped.authorizationDecision &&
            input.wrapped.authorizationDecision !== "approved"
          ? "REFUSED_UNAUTHORIZED"
          : input.wrapped.activationRecord?.complianceSnapshot?.status !== "compliant"
          ? "REFUSED_UNCOMPLIANT"
          : "REFUSED_UNTRUSTED",
      reason: validation.reason,
      sourceActivationRecord: input.wrapped.activationRecord ?? null,
      liveSystemRecord: null,
      trustedEnvelopeId: input.wrapped.trustedEnvelopeId,
      authorizationDecision: input.wrapped.authorizationDecision,
      registryValid: input.wrapped.registryValid,
    };
  }

  const trustController = input.trustController ?? new TrustSpineController();
  const liveSystemRecord = createLiveSystemRecord({
    activationRecord: input.wrapped.activationRecord,
    receivingEnvironment: receivingPolicy.receivingEnvironment,
  });

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.trustPolicy,
    request: {
      action: "create_live_system_record",
      artifactType: receivingPolicy.artifactType,
      scope: receivingPolicy.trustScope,
      justification: "Receiving environment creation from trusted activated transaction state.",
    },
    payload: liveSystemRecord,
    parentArtifactIds: input.wrapped.trustedEnvelopeId
      ? [input.wrapped.trustedEnvelopeId]
      : [],
  });

  if (trusted.receipt.decision !== "approved") {
    return {
      received: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: `Receiving authorization decision was ${trusted.receipt.decision}.`,
      sourceActivationRecord: input.wrapped.activationRecord,
      liveSystemRecord: null,
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
    return {
      received: false,
      decision: "REFUSED_TAMPERED",
      reason: "Live system record failed integrity verification.",
      sourceActivationRecord: input.wrapped.activationRecord,
      liveSystemRecord: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  if (!snapshot.canPropagate) {
    return {
      received: false,
      decision: "REFUSED_QUARANTINED",
      reason: "Live system record cannot propagate.",
      sourceActivationRecord: input.wrapped.activationRecord,
      liveSystemRecord: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  return {
    received: true,
    decision: "RECEIVED",
    reason: "Receiving bridge created live system record.",
    sourceActivationRecord: input.wrapped.activationRecord,
    liveSystemRecord,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}