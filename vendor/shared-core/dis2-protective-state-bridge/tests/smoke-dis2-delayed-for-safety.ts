import { runDis2ProtectiveStateBridge } from "../src/index.js";

const result = runDis2ProtectiveStateBridge({
  subjectId: "sub_603",
  protectedFlow: {
    flowId: "flow_603",
    subjectId: "sub_603",
    checkpointHealth: "swollen",
    protectedChannelState: "held",
    restorationPlanned: true,
    reason: "Held for safety.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.protectiveState !== "DELAYED_FOR_SAFETY") {
  throw new Error("Expected DELAYED_FOR_SAFETY state.");
}

console.log("SMOKE_DIS2_DELAYED_FOR_SAFETY=PASS");