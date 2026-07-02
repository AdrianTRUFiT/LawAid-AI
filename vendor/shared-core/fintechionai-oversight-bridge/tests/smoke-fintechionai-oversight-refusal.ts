import type { ActorIdentity, PolicySnapshot } from "../../trust-spine/src/index.js";
import { issueFinTechionAIOversightState } from "../src/index.js";
import { evaluateProtectedFlow } from "../../protected-flow-layer/src/index.js";

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

const protectedFlow = evaluateProtectedFlow({
  flowId: "flow_bad_001",
  checkpoint: {
    checkpointId: "cp_bad",
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
      channelId: "channel_bad",
      authorityType: "oversight",
      state: "healthy",
      continuityScore: 100,
    },
  ],
});

const result = issueFinTechionAIOversightState({
  oversightInput: {
    activationRecords: [],
    protectedFlow,
    processorFeeRate: 0.03,
  },
  actor,
  trustPolicy,
});

if (result.trusted || result.decision !== "REFUSED_MALFORMED") {
  throw new Error(`Expected REFUSED_MALFORMED but received ${result.decision}`);
}

console.log("SMOKE_FINTECHIONAI_OVERSIGHT_REFUSAL=PASS");