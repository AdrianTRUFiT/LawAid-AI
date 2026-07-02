import {
  persistIngress,
  getIngressRecord,
  listIngressByState,
  resolvePersistedHeld
} from './ingressPersistence';

const accepted = persistIngress({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter and understanding next steps.",
  actorId: "ACTOR-PERSIST-001",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const held = persistIngress({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter.",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const refused = persistIngress({
  source: "UNKNOWN",
  rawSignal: "This should not enter the system.",
  actorId: "ACTOR-PERSIST-003",
  intendedPath: "TEST_PATH",
  consent: true
});

const heldBefore = listIngressByState("HELD");

const resolved = resolvePersistedHeld(held.recordId, {
  actorId: "ACTOR-PERSIST-RESOLVED"
});

const fetchedAccepted = getIngressRecord(accepted.recordId);
const fetchedResolved = getIngressRecord(held.recordId);
const acceptedList = listIngressByState("ACCEPTED");
const resolvedList = listIngressByState("RESOLVED");
const refusedList = listIngressByState("REFUSED");

console.log("INGRESS_PERSISTENCE_V1=START");

console.log("----");
console.log("ACCEPTED_PERSISTED");
console.log(JSON.stringify(accepted, null, 2));

console.log("----");
console.log("HELD_PERSISTED");
console.log(JSON.stringify(held, null, 2));

console.log("----");
console.log("REFUSED_PERSISTED");
console.log(JSON.stringify(refused, null, 2));

console.log("----");
console.log("HELD_BEFORE_RESOLUTION");
console.log(JSON.stringify(heldBefore.map(r => r.recordId), null, 2));

console.log("----");
console.log("RESOLVED_HELD");
console.log(JSON.stringify(resolved, null, 2));

console.log("---- VERIFICATION ----");

const acceptedPersistedOk =
  fetchedAccepted &&
  fetchedAccepted.recordId === accepted.recordId &&
  fetchedAccepted.state === "ACCEPTED";

const heldResolvedOk =
  resolved.status === "RESOLVED" &&
  fetchedResolved &&
  fetchedResolved.state === "RESOLVED";

const refusedPersistedOk =
  refused.state === "REFUSED" &&
  refusedList.some(r => r.recordId === refused.recordId);

const queueQueryOk =
  acceptedList.some(r => r.recordId === accepted.recordId) &&
  resolvedList.some(r => r.recordId === held.recordId);

const historyOk =
  fetchedResolved &&
  fetchedResolved.history.some(h => h.action === "HELD_RESOLVED");

console.log({
  acceptedPersistedOk,
  heldResolvedOk,
  refusedPersistedOk,
  queueQueryOk,
  historyOk
});

if (!acceptedPersistedOk || !heldResolvedOk || !refusedPersistedOk || !queueQueryOk || !historyOk) {
  throw new Error("INGRESS_PERSISTENCE_V1_FAILED");
}

console.log("INGRESS_PERSISTENCE_V1=PASS");
console.log("INGRESS_PERSISTENCE_V1=COMPLETE");
