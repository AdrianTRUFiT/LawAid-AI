import { runLifecycleRegistry } from "../src/index.js";

const result = runLifecycleRegistry({
  subjectId: "user_004",
  currentState: "CANCELED_PERIOD_END",
  requestedState: "ARCHIVED",
  sourceEvent: "period_end_reached",
});

if (!result.ok || !result.artifact || result.artifact.nextState !== "ARCHIVED") {
  throw new Error("Expected archive transition.");
}

console.log("SMOKE_LIFECYCLE_ARCHIVE=PASS");