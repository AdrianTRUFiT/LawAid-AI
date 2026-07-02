import { runDis2ProtectiveStateBridge } from "../src/index.js";

const result = runDis2ProtectiveStateBridge({
  subjectId: "sub_605",
  protectedFlow: {
    flowId: "",
    subjectId: "sub_605",
    checkpointHealth: "healthy",
    protectedChannelState: "open",
    restorationPlanned: false,
    reason: "Bad record.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "MALFORMED_PROTECTED_FLOW") {
  throw new Error("Expected malformed protected-flow refusal.");
}

console.log("SMOKE_DIS2_MALFORMED=PASS");