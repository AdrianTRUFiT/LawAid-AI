import type { ActorIdentity, PolicySnapshot } from "../../trust-spine/src/index.js";
import { TrustSpineController } from "../../trust-spine/src/index.js";
import type {
  FinTechionAIOversightInput,
  FinTechionAIOversightResult,
  GovernedFinancialOversightState,
  OversightDecision,
} from "./contracts.js";
import { deriveMerchantHealthState, deriveRecommendedActions, buildOversightAnomalies } from "./anomalyEngine.js";
import { validateOversightInput } from "./validators.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function buildGovernedFinancialOversightState(
  input: FinTechionAIOversightInput,
): GovernedFinancialOversightState {
  const grossRevenue = round2(
    input.activationRecords.reduce((sum, x) => sum + x.settlementAmount, 0),
  );

  const feeRate = input.processorFeeRate ?? 0.03;
  const feeExposure = round2(grossRevenue * feeRate);
  const refundExposure = round2(input.refundExposure ?? 0);
  const disputeExposure = round2(input.disputeExposure ?? 0);
  const netRevenue = round2(grossRevenue - feeExposure - refundExposure - disputeExposure);

  const anomalyFlags = buildOversightAnomalies(input);
  const merchantHealthState = deriveMerchantHealthState(anomalyFlags);
  const recommendedActions = deriveRecommendedActions(anomalyFlags);

  const complianceFlags = input.activationRecords
    .filter((x) => x.complianceSnapshot.status !== "compliant")
    .map((x) => `activation:${x.activationId}:non_compliant`);

  return {
    oversightStateId: makeId("oversight"),
    period: input.period ?? new Date().toISOString().slice(0, 10),
    sourceSystems: input.sourceSystems ?? ["FundTrackerAI", "ProtectedFlowLayer"],
    grossRevenue,
    netRevenue,
    feeExposure,
    refundExposure,
    disputeExposure,
    anomalyFlags,
    complianceFlags,
    merchantHealthState,
    recommendedActions,
    activationCount: input.activationRecords.length,
    protectedFlowDecision: input.protectedFlow.snapshot.decision,
    generatedAt: new Date().toISOString(),
  };
}

export function issueFinTechionAIOversightState(input: {
  oversightInput: FinTechionAIOversightInput;
  actor: ActorIdentity;
  trustPolicy: PolicySnapshot;
  trustController?: TrustSpineController;
}): FinTechionAIOversightResult {
  const validation = validateOversightInput(input.oversightInput);

  if (!validation.ok) {
    return {
      trusted: false,
      decision: "REFUSED_MALFORMED",
      reason: validation.reason,
      oversightState: null,
    };
  }

  const oversightState = buildGovernedFinancialOversightState(input.oversightInput);
  const trustController = input.trustController ?? new TrustSpineController();

  const trusted = trustController.createGovernedArtifact({
    actor: input.actor,
    policy: input.trustPolicy,
    request: {
      action: "issue_fintechionai_oversight_state",
      artifactType: "GovernedFinancialOversightState",
      scope: "financial_oversight",
      justification: "FinTechionAI operator-side financial oversight emission.",
    },
    payload: oversightState,
  });

  if (trusted.receipt.decision !== "approved") {
    return {
      trusted: false,
      decision: "REFUSED_UNTRUSTED",
      reason: `Authorization decision was ${trusted.receipt.decision}.`,
      oversightState: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  const snapshot = trustController.snapshot({
    envelope: trusted.envelope,
    authorizationApproved: true,
  });

  if (snapshot.isTampered || !snapshot.canPropagate) {
    return {
      trusted: false,
      decision: "REFUSED_UNTRUSTED",
      reason: "Oversight artifact failed trust checks.",
      oversightState: null,
      trustedEnvelopeId: trusted.envelope.artifactId,
      authorizationDecision: trusted.receipt.decision,
      registryValid: trustController.getRegistry().verifyChain(),
    };
  }

  let decision: OversightDecision = "OVERSIGHT_READY";

  if (oversightState.merchantHealthState === "watch") {
    decision = "OVERSIGHT_WARNING";
  }

  if (
    oversightState.merchantHealthState === "elevated_risk" ||
    oversightState.merchantHealthState === "degraded"
  ) {
    decision = "OVERSIGHT_ESCALATED";
  }

  return {
    trusted: true,
    decision,
    reason: "Governed Financial Oversight State issued.",
    oversightState,
    trustedEnvelopeId: trusted.envelope.artifactId,
    authorizationDecision: trusted.receipt.decision,
    registryValid: trustController.getRegistry().verifyChain(),
  };
}