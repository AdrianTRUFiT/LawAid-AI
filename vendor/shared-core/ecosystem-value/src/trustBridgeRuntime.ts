import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  IncomingTrustValidationResult,
  SettlementBridgePolicy,
  TrustWrappedSettlementResult,
} from "./trustBridgeContracts.js";
import type { SettlementRecord } from "./contracts.js";
import { validateSettlementPolicy, validateSettlementShape } from "./trustBridgeValidators.js";

function defaultBridgePolicy(): SettlementBridgePolicy {
  return {
    trustScope: "financial",
    artifactType: "EcosystemSettlementRecord",
    requireComplianceStatus: "compliant",
    requireSettledStatus: true,
  };
}

export function trustWrapSharedSettlement(input: {
  settlementRecord: SettlementRecord;
  actor: ActorIdentity;
  policy: PolicySnapshot;
  trustController?: TrustSpineController;
  bridgePolicy?: SettlementBridgePolicy;
  parentArtifactIds?: string[];
}): TrustWrappedSettlementResult {
  const bridgePolicy = input.bridgePolicy ?? defaultBridgePolicy();

  if (!validateSettlementShape(input.settlementRecord)) {
    return {
      trusted: false,
      decision: "REFUSED_MALFORMED",
      reason: "Settlement record shape is invalid.",
      settlementRecord: input.settlementRecord,
    };
  }

  const settlementPolicyCheck = validateSettlementPolicy(
    input.settlementRecord,
    bridgePolicy,
  );

  if (!settlementPolicyCheck.ok) {
    return {
      trusted: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: settlementPolicyCheck.reason,
      settlementRecord: input.settlementRecord,
    };
  }

  const trustController = input.trustController ?? new TrustSpineController();

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.policy,
    request: {
      action: "bridge_shared_settlement",
      artifactType: bridgePolicy.artifactType,
      scope: bridgePolicy.trustScope,
      justification: "Shared ecosystem settlement bridged into shared trust artifact law.",
    },
    payload: input.settlementRecord,
    parentArtifactIds: input.parentArtifactIds,
  });

  if (trusted.receipt.decision !== "approved") {
    return {
      trusted: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: `Authorization receipt decision was ${trusted.receipt.decision}.`,
      settlementRecord: input.settlementRecord,
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
      trusted: false,
      decision: "REFUSED_TAMPERED",
      reason: "Trusted envelope failed integrity verification.",
      settlementRecord: input.settlementRecord,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  if (!snapshot.canPropagate) {
    return {
      trusted: false,
      decision: "REFUSED_QUARANTINED",
      reason: "Trusted envelope cannot propagate.",
      settlementRecord: input.settlementRecord,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  return {
    trusted: true,
    decision: "TRUSTED",
    reason: "Shared settlement successfully trust-wrapped.",
    settlementRecord: input.settlementRecord,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}

export function validateIncomingTrustedSettlement(input: {
  incoming: unknown;
  bridgePolicy?: SettlementBridgePolicy;
}): IncomingTrustValidationResult {
  const bridgePolicy = input.bridgePolicy ?? defaultBridgePolicy();

  if (!validateSettlementShape(input.incoming)) {
    return {
      accepted: false,
      decision: "REFUSED_MALFORMED",
      reason: "Incoming settlement record is malformed.",
      settlementRecord: null,
      complianceSnapshot: null,
    };
  }

  const record = input.incoming as SettlementRecord;
  const policyCheck = validateSettlementPolicy(record, bridgePolicy);

  if (!policyCheck.ok) {
    return {
      accepted: false,
      decision: "REFUSED_UNAUTHORIZED",
      reason: policyCheck.reason,
      settlementRecord: null,
      complianceSnapshot: record.complianceSnapshot,
    };
  }

  return {
    accepted: true,
    decision: "TRUSTED",
    reason: "Incoming shared settlement record is valid.",
    settlementRecord: record,
    complianceSnapshot: record.complianceSnapshot,
  };
}