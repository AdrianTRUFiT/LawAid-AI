import { resolveHeldIngress } from './heldResolutionEngine';

const missingActorResolved = resolveHeldIngress({
  originalInput: {
    source: "LAWAIDAI",
    rawSignal: "I need help organizing a legal matter.",
    intendedPath: "LAW_AID_CLARITY",
    consent: true
  },
  patch: {
    actorId: "ACTOR-RESOLVED-001"
  }
});

const missingPathResolved = resolveHeldIngress({
  originalInput: {
    source: "LAWAIDAI",
    rawSignal: "I need help organizing a legal matter.",
    actorId: "ACTOR-002",
    consent: true
  },
  patch: {
    intendedPath: "LAW_AID_CLARITY"
  }
});

const heldStillBlocked = resolveHeldIngress({
  originalInput: {
    source: "LAWAIDAI",
    rawSignal: "I need help organizing a legal matter.",
    intendedPath: "LAW_AID_CLARITY",
    consent: true
  },
  patch: {}
});

const refusedNotResolved = resolveHeldIngress({
  originalInput: {
    source: "UNKNOWN",
    rawSignal: "This should not enter.",
    actorId: "ACTOR-003",
    intendedPath: "TEST_PATH",
    consent: true
  },
  patch: {
    source: "SYSTEM_TEST"
  }
});

console.log("HELD_RESOLUTION_V1=START");

console.log("----");
console.log("MISSING_ACTOR_RESOLVED");
console.log(JSON.stringify(missingActorResolved, null, 2));

console.log("----");
console.log("MISSING_PATH_RESOLVED");
console.log(JSON.stringify(missingPathResolved, null, 2));

console.log("----");
console.log("HELD_STILL_BLOCKED");
console.log(JSON.stringify(heldStillBlocked, null, 2));

console.log("----");
console.log("REFUSED_NOT_HELD_NO_RESOLUTION_REQUIRED");
console.log(JSON.stringify(refusedNotResolved, null, 2));

const actorResolvedOk =
  missingActorResolved.status === "HELD_RESOLVED" &&
  missingActorResolved.firstPass.decision === "HELD" &&
  missingActorResolved.secondPass.decision === "ACCEPTED";

const pathResolvedOk =
  missingPathResolved.status === "HELD_RESOLVED" &&
  missingPathResolved.firstPass.decision === "HELD" &&
  missingPathResolved.secondPass.decision === "ACCEPTED";

const stillBlockedOk =
  heldStillBlocked.status === "HELD_NOT_RESOLVED" &&
  heldStillBlocked.secondPass.decision === "HELD";

const refusedNotResolvedOk =
  refusedNotResolved.status === "NO_HELD_RESOLUTION_REQUIRED" &&
  refusedNotResolved.firstPass.decision === "REFUSED";

console.log("---- VERIFICATION ----");
console.log({
  actorResolvedOk,
  pathResolvedOk,
  stillBlockedOk,
  refusedNotResolvedOk
});

if (!actorResolvedOk || !pathResolvedOk || !stillBlockedOk || !refusedNotResolvedOk) {
  throw new Error("HELD_RESOLUTION_V1_FAILED");
}

console.log("HELD_RESOLUTION_V1=PASS");
console.log("HELD_RESOLUTION_V1=COMPLETE");
