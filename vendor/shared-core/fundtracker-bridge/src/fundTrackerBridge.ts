import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  TrustWrappedSettlementResult,
} from "../../ecosystem-value/src/index.js";
import { createDefaultFundTrackerActivationPolicy } from "./activationPolicy.js";
import type {
  ActivatedTransactionStateRecord,
  FundTrackerActivationPolicy,
  FundTrackerActivationResult,
} from "./contracts.js";
import { validateTrustedSettlementForFundTracker } from "./validators.js";

function makeActivationId(): string {
  return `ats-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createActivatedTransactionStateRecord(input: {
  wrapped: TrustWrappedSettlementResult;
}): ActivatedTransactionStateRecord {
  const settlement = input.wrapped.settlementRecord;

  return {
    activationId: makeActivationId(),
    sourceSettlementId: settlement.settlementId,
    walletId: settlement.walletId,
    ownerId: settlement.ownerId,
    merchantId: settlement.merchantId,
    jurisdictionCode: settlement.jurisdictionCode,
    settlementCurrency: settlement.settlementCurrency,
    settlementAmount: settlement.settlementAmount,
    displayCurrency: settlement.displayCurrency,
    displayAmount: settlement.displayAmount,
    realValueUnits: settlement.realValueUnits,
    fundingChoices: settlement.fundingChoices,
    complianceSnapshot: settlement.complianceSnapshot,
    activationStatus: "activated",
    occurredAt: new Date().toISOString(),
  };
}

export function activateTrustedSettlementForFundTracker(input: {
  wrapped: TrustWrappedSettlementResult;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
  trustController?: TrustSpineController;
  activationPolicy?: FundTrackerActivationPolicy;
}): FundTrackerActivationResult {
  const activationPolicy =
    input.activationPolicy ?? createDefaultFundTrackerActivationPolicy();

  const validation = validateTrustedSettlementForFundTracker({
    wrapped: input.wrapped,
    policy: activationPolicy,
  });

  if (!validation.ok) {
    return {
      activated: false,
      decision:
        input.wrapped.decision === "REFUSED_TAMPERED"
          ? "REFUSED_TAMPERED"
          : input.wrapped.decision === "REFUSED_QUARANTINED"
          ? "REFUSED_QUARANTINED"
          : input.wrapped.authorizationDecision &&
            input.wrapped.authorizationDecision !== "approved"
          ? "REFUSED_UNAUTHORIZED"
          : input.wrapped.settlementRecord?.complianceSnapshot?.status !== "compliant"
          ? "REFUSED_UNCOMPLIANT"
          : "REFUSED_UNTRUSTED",
      reason: validation.reason,
      sourceSettlementRecord: input.wrapped.settlementRecord ?? null,
      activationRecord: null,
      trustedEnvelopeId: input.wrapped.trustedEnvelopeId,
      authorizationDecision: input.wrapped.authorizationDecision,
      registryValid: input.wrapped.registryValid,
    };
  }

  const trustController = input.trustController ?? new TrustSpineController();
  const activationRecord = createActivatedTransactionStateRecord({
    wrapped: input.wrapped,
  });

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.trustPolicy,
    request: {
      action: "activate_transaction_state",
      artifactType: activationPolicy.artifactType,
      scope: activationPolicy.trustScope,
      justification: "FundTrackerAI activation from trusted shared settlement.",
    },
    payload: activationRecord,
    parentArtifactIds: input.wrapped.trustedEnvelopeId
      ? [input.wrapped.trustedEnvelopeId]
      : [],
  });

  if (trusted.receipt.decision !== "approved") {
    return {
      activated: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: `Activation authorization decision was ${trusted.receipt.decision}.`,
      sourceSettlementRecord: input.wrapped.settlementRecord,
      activationRecord: null,
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
      activated: false,
      decision: "REFUSED_TAMPERED",
      reason: "Activated transaction state failed integrity verification.",
      sourceSettlementRecord: input.wrapped.settlementRecord,
      activationRecord: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  if (!snapshot.canPropagate) {
    return {
      activated: false,
      decision: "REFUSED_QUARANTINED",
      reason: "Activated transaction state cannot propagate.",
      sourceSettlementRecord: input.wrapped.settlementRecord,
      activationRecord: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  return {
    activated: true,
    decision: "ACTIVATED",
    reason: "FundTracker activation completed.",
    sourceSettlementRecord: input.wrapped.settlementRecord,
    activationRecord,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}