import { evaluateProtectedFlow } from "../src/index.js";

const result = evaluateProtectedFlow({
  flowId: "flow_healthy_001",
  checkpoint: {
    checkpointId: "cp_healthy",
    checkpointLabel: "Admission Gate",
    waitMinutes: 3,
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
      channelId: "channel_001",
      authorityType: "admission",
      state: "healthy",
      continuityScore: 100,
    },
  ],
});

if (result.snapshot.decision !== "FLOW_HEALTHY") {
  throw new Error(`Expected FLOW_HEALTHY but received ${result.snapshot.decision}`);
}

if (!result.snapshot.protectedFlowHealthy) {
  throw new Error("Expected protected flow to be healthy.");
}

console.log("SMOKE_PROTECTED_FLOW_HEALTHY=PASS");