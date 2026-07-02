import { runLifecycleRegistry } from "../src/index.js";

const result = runLifecycleRegistry({
  subjectId: "user_002",
  currentState: "PROSPECT",
  requestedState: "ARCHIVED",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_TRANSITION") {
  throw new Error("Expected invalid-transition refusal.");
}

console.log("SMOKE_LIFECYCLE_INVALID=PASS");