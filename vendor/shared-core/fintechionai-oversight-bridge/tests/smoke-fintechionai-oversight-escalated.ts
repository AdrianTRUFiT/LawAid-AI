import type { ActorIdentity, PolicySnapshot } from "../../trust-spine/src/index.js";
import { issueFinTechionAIOversightState } from "../src/index.js";
import { evaluateProtectedFlow } from "../../protected-flow-layer/src/index.js";
import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";

const actor: ActorIdentity = {
  actorId: "fintechionai-operator",
  role: "operator",
  scope: ["financial_oversight"],
  keyId: "fintechionai-key-001",
};

const trustPolicy: PolicySnapshot = {
  policyId: "fintechionai-oversight-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["GovernedFinancialOversightState"],
  allowedScopes: ["financial_oversight"],
};

const activation: ActivatedTransactionStateRecord = {
  activationId: "ats_risk_001",
  sourceSettlementId: "settlement_risk_001",
  walletId: "wallet_risk_001",
  ownerId: "owner_risk_001",
  merchantId: "merchant_risk_001",
  jurisdictionCode: "US",
  settlementCurrency: "USD",
  settlementAmount: 120,
  displayCurrency: "USD",
  displayAmount: 120,
  realValueUnits: 120,
  fundingChoices: [],
  complianceSnapshot: {
    jurisdictionCode: "US",
    merchantId: "merchant_risk_001",
    trustTier: "trusted",
    kycSatisfied: true,
    policySatisfied: true,
    acceptedValueKinds: ["stable_value"],
    allowedRails: ["stable_settlement"],
    status: "compliant",
    notes: [],
    createdAt: new Date().toISOString(),
  },
  activationStatus: "activated",
  occurredAt: new Date().toISOString(),
};

const protectedFlow = evaluateProtectedFlow({
  flowId: "flow_risk_001",
  checkpoint: {
    checkpointId: "cp_risk",
    checkpointLabel: "Protected Financial Routing",
    waitMinutes: 40,
    retryCount: 2,
    reopenCount: 1,
    manualInterventionCount: 2,
    blockedReleaseCount: 1,
    downstreamConsequenceCount: 1,
    costInflationDelta: 10,
    channelDiscontinuityEvents: 1,
    recoveryDepth: 1,
  },
  protectedChannels: [
    {
      channelId: "channel_risk",
      authorityType: "oversight",
      state: "degraded",
      continuityScore: 62,
    },
  ],
});

const result = issueFinTechionAIOversightState({
  oversightInput: {
    activationRecords: [activation],
    protectedFlow,
    processorFeeRate: 0.03,
    refundExposure: 12,
    disputeExposure: 2,
    sourceSystems: ["FundTrackerAI", "ProtectedFlowLayer"],
  },
  actor,
  trustPolicy,
});

if (!result.trusted || result.decision !== "OVERSIGHT_ESCALATED" || !result.oversightState) {
  throw new Error(`Expected OVERSIGHT_ESCALATED but received ${result.decision}`);
}

console.log("SMOKE_FINTECHIONAI_OVERSIGHT_ESCALATED=PASS");