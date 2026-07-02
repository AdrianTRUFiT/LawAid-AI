import { evaluateIngress } from './ingressGate';

const accepted = evaluateIngress({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter and understanding next steps.",
  actorId: "ACTOR-001",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const missingActor = evaluateIngress({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter.",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const unknownSource = evaluateIngress({
  source: "UNKNOWN",
  rawSignal: "This should not enter the system.",
  actorId: "ACTOR-002",
  intendedPath: "TEST_PATH",
  consent: true
});

const noConsent = evaluateIngress({
  source: "AI_TRACK",
  rawSignal: "Use this identity-linked asset.",
  actorId: "ACTOR-003",
  intendedPath: "IDENTITY_USAGE",
  consent: false
});

const emptySignal = evaluateIngress({
  source: "SYSTEM_TEST",
  rawSignal: "",
  actorId: "ACTOR-004",
  intendedPath: "TEST_PATH",
  consent: true
});

console.log("INGRESS_GATE_V1=START");

console.log("----");
console.log("ACCEPTED_INGRESS");
console.log(JSON.stringify(accepted, null, 2));

console.log("----");
console.log("MISSING_ACTOR_HELD");
console.log(JSON.stringify(missingActor, null, 2));

console.log("----");
console.log("UNKNOWN_SOURCE_REFUSED");
console.log(JSON.stringify(unknownSource, null, 2));

console.log("----");
console.log("NO_CONSENT_REFUSED");
console.log(JSON.stringify(noConsent, null, 2));

console.log("----");
console.log("EMPTY_SIGNAL_REFUSED");
console.log(JSON.stringify(emptySignal, null, 2));

const acceptedOk =
  accepted.decision === "ACCEPTED" &&
  accepted.normalized &&
  accepted.proof &&
  accepted.proof.closureState === "CLOSED";

const missingActorOk =
  missingActor.decision === "HELD" &&
  missingActor.reason === "ACTOR_ID_REQUIRED";

const unknownSourceOk =
  unknownSource.decision === "REFUSED" &&
  unknownSource.reason === "UNKNOWN_SOURCE_REFUSED";

const noConsentOk =
  noConsent.decision === "REFUSED" &&
  noConsent.reason === "CONSENT_REQUIRED_AT_INGRESS";

const emptySignalOk =
  emptySignal.decision === "REFUSED" &&
  emptySignal.reason === "RAW_SIGNAL_REQUIRED";

console.log("---- VERIFICATION ----");
console.log({
  acceptedOk,
  missingActorOk,
  unknownSourceOk,
  noConsentOk,
  emptySignalOk
});

if (!acceptedOk || !missingActorOk || !unknownSourceOk || !noConsentOk || !emptySignalOk) {
  throw new Error("INGRESS_GATE_V1_FAILED");
}

console.log("INGRESS_GATE_V1=PASS");
console.log("INGRESS_GATE_V1=COMPLETE");
