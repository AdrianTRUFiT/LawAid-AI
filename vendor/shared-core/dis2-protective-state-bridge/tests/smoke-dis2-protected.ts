import { runDis2ProtectiveStateBridge } from "../src/index.js";

const result = runDis2ProtectiveStateBridge({
  subjectId: "sub_601",
  protectedFlow: {
    flowId: "flow_601",
    subjectId: "sub_601",
    checkpointHealth: "healthy",
    protectedChannelState: "open",
    restorationPlanned: false,
    reason: "Healthy path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.protectiveState !== "PROTECTED") {
  throw new Error("Expected PROTECTED state.");
}

console.log("SMOKE_DIS2_PROTECTED=PASS");