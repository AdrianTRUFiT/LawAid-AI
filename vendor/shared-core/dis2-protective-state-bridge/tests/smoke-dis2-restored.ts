import { runDis2ProtectiveStateBridge } from "../src/index.js";

const result = runDis2ProtectiveStateBridge({
  subjectId: "sub_604",
  protectedFlow: {
    flowId: "flow_604",
    subjectId: "sub_604",
    checkpointHealth: "restored",
    protectedChannelState: "restored",
    restorationPlanned: false,
    reason: "Restored path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.protectiveState !== "RESTORED") {
  throw new Error("Expected RESTORED state.");
}

console.log("SMOKE_DIS2_RESTORED=PASS");