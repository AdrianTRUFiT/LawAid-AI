import { runLifecycleRegistry } from "../src/index.js";

const result = runLifecycleRegistry({
  subjectId: "user_005",
  currentState: "ACTIVE_PAID",
  requestedState: "CANCELED_PERIOD_END",
  sourceEvent: "cancel_requested",
});

if (!result.ok || !result.artifact || result.artifact.nextState !== "CANCELED_PERIOD_END") {
  throw new Error("Expected cancel-period-end transition.");
}

console.log("SMOKE_LIFECYCLE_CANCEL_PERIOD_END=PASS");