import { evaluateProtectedFlow } from "../src/index.js";

const result = evaluateProtectedFlow({
  flowId: "flow_blocked_001",
  checkpoint: {
    checkpointId: "cp_blocked",
    checkpointLabel: "Authority Release",
    waitMinutes: 60,
    retryCount: 3,
    reopenCount: 2,
    manualInterventionCount: 3,
    blockedReleaseCount: 2,
    downstreamConsequenceCount: 2,
    costInflationDelta: 20,
    channelDiscontinuityEvents: 2,
    recoveryDepth: 2,
  },
  protectedChannels: [
    {
      channelId: "channel_003",
      authorityType: "release",
      state: "broken",
      continuityScore: 20,
    },
  ],
});

if (result.snapshot.decision !== "FLOW_BLOCKED") {
  throw new Error(`Expected FLOW_BLOCKED but received ${result.snapshot.decision}`);
}

if (result.restorationPlan === null || result.restorationPlan.releaseReady) {
  throw new Error("Expected blocked restoration plan with releaseReady=false.");
}

console.log("SMOKE_PROTECTED_FLOW_BLOCKED=PASS");