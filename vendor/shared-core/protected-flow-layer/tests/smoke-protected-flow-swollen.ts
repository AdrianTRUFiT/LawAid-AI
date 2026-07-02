import { evaluateProtectedFlow } from "../src/index.js";

const result = evaluateProtectedFlow({
  flowId: "flow_swollen_001",
  checkpoint: {
    checkpointId: "cp_swollen",
    checkpointLabel: "Protected Routing",
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
      channelId: "channel_002",
      authorityType: "routing",
      state: "degraded",
      continuityScore: 62,
    },
  ],
});

if (
  result.snapshot.decision !== "FLOW_SWOLLEN" &&
  result.snapshot.decision !== "FLOW_BLOCKED"
) {
  throw new Error(`Expected swollen or blocked but received ${result.snapshot.decision}`);
}

if (result.restorationPlan === null) {
  throw new Error("Expected restoration plan for swollen flow.");
}

console.log("SMOKE_PROTECTED_FLOW_SWOLLEN=PASS");