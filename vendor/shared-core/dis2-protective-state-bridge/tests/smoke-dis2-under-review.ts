import { runDis2ProtectiveStateBridge } from "../src/index.js";

const result = runDis2ProtectiveStateBridge({
  subjectId: "sub_602",
  protectedFlow: {
    flowId: "flow_602",
    subjectId: "sub_602",
    checkpointHealth: "swollen",
    protectedChannelState: "watch",
    restorationPlanned: true,
    reason: "Swelling path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.protectiveState !== "UNDER_REVIEW") {
  throw new Error("Expected UNDER_REVIEW state.");
}

console.log("SMOKE_DIS2_UNDER_REVIEW=PASS");