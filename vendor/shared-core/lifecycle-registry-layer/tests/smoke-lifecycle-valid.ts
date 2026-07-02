import { runLifecycleRegistry } from "../src/index.js";

const result = runLifecycleRegistry({
  subjectId: "user_001",
  currentState: "PENDING_ACCEPTANCE",
  requestedState: "ACTIVE_TRIAL",
  sourceEvent: "offer_accepted",
});

if (!result.ok || !result.artifact || result.artifact.nextState !== "ACTIVE_TRIAL") {
  throw new Error("Expected valid lifecycle transition.");
}

console.log("SMOKE_LIFECYCLE_VALID=PASS");