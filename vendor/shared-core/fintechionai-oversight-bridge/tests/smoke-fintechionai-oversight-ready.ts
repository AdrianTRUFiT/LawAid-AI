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
  activationId: "ats_ready_001",
  sourceSettlementId: "settlement_ready_001",
  walletId: "wallet_ready_001",
  ownerId: "owner_ready_001",
  merchantId: "merchant_ready_001",
  jurisdictionCode: "US",
  settlementCurrency: "USD",
  settlementAmount: 25,
  displayCurrency: "USD",
  displayAmount: 25,
  realValueUnits: 25,
  fundingChoices: [],
  complianceSnapshot: {
    jurisdictionCode: "US",
    merchantId: "merchant_ready_001",
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
  flowId: "flow_ready_001",
  checkpoint: {
    checkpointId: "cp_ready",
    checkpointLabel: "Protected Financial Routing",
    waitMinutes: 2,
    retryCount: 0,
    reopenCount: 0,
    manualInterventionCount: 0,
    blockedReleaseCount: 0,
    downstreamConsequenceCount: 0,
    costInflationDelta: 0,
    channelDiscontinuityEvents: 0,
    recoveryDepth: 0,
  },
  protectedChannels: [
    {
      channelId: "channel_ready",
      authorityType: "oversight",
      state: "healthy",
      continuityScore: 100,
    },
  ],
});

const result = issueFinTechionAIOversightState({
  oversightInput: {
    activationRecords: [activation],
    protectedFlow,
    processorFeeRate: 0.03,
    refundExposure: 0,
    disputeExposure: 0,
    sourceSystems: ["FundTrackerAI", "ProtectedFlowLayer"],
  },
  actor,
  trustPolicy,
});

if (!result.trusted || result.decision !== "OVERSIGHT_READY" || !result.oversightState) {
  throw new Error(`Expected OVERSIGHT_READY but received ${result.decision}`);
}

console.log("SMOKE_FINTECHIONAI_OVERSIGHT_READY=PASS");