import { runLifecycleRegistry } from "../src/index.js";

const result = runLifecycleRegistry({
  subjectId: "user_003",
  currentState: "ARCHIVED",
  requestedState: "REACTIVATED",
  sourceEvent: "user_returned",
});

if (!result.ok || !result.artifact || result.artifact.nextState !== "REACTIVATED") {
  throw new Error("Expected reactivation transition.");
}

console.log("SMOKE_LIFECYCLE_REACTIVATED=PASS");