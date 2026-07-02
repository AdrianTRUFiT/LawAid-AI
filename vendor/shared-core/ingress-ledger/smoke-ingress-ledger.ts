import {
  persistIngressWithLedger,
  resolveHeldWithLedger,
  verifyIngressLedger,
  getIngressLedgerEntries
} from './ingressLedger';

console.log("INGRESS_LEDGER_V1=START");

const accepted = persistIngressWithLedger({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter and understanding next steps.",
  actorId: "ACTOR-LEDGER-001",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const held = persistIngressWithLedger({
  source: "LAWAIDAI",
  rawSignal: "I need help organizing a legal matter.",
  intendedPath: "LAW_AID_CLARITY",
  consent: true
});

const refused = persistIngressWithLedger({
  source: "UNKNOWN",
  rawSignal: "This should not enter.",
  actorId: "ACTOR-LEDGER-003",
  intendedPath: "TEST_PATH",
  consent: true
});

const resolved = resolveHeldWithLedger(held.record.recordId, {
  actorId: "ACTOR-LEDGER-RESOLVED"
});

const verification = verifyIngressLedger();
const entries = getIngressLedgerEntries();

console.log("----");
console.log("ACCEPTED_WITH_LEDGER");
console.log(JSON.stringify(accepted, null, 2));

console.log("----");
console.log("HELD_WITH_LEDGER");
console.log(JSON.stringify(held, null, 2));

console.log("----");
console.log("REFUSED_WITH_LEDGER");
console.log(JSON.stringify(refused, null, 2));

console.log("----");
console.log("RESOLVED_WITH_LEDGER");
console.log(JSON.stringify(resolved, null, 2));

console.log("----");
console.log("LEDGER_VERIFICATION");
console.log(JSON.stringify(verification, null, 2));

console.log("---- VERIFICATION ----");

const acceptedLedgerOk =
  accepted.ledger.action === "INGRESS_PERSISTED" &&
  accepted.ledger.state === "ACCEPTED";

const heldLedgerOk =
  held.ledger.action === "INGRESS_PERSISTED" &&
  held.ledger.state === "HELD";

const refusedLedgerOk =
  refused.ledger.action === "REFUSAL_RECORDED" &&
  refused.ledger.state === "REFUSED";

const resolvedLedgerOk =
  resolved.ledger.action === "HELD_RESOLVED" &&
  resolved.ledger.state === "RESOLVED";

const chainOk =
  verification.verified === true &&
  entries.length >= 4;

console.log({
  acceptedLedgerOk,
  heldLedgerOk,
  refusedLedgerOk,
  resolvedLedgerOk,
  chainOk
});

if (!acceptedLedgerOk || !heldLedgerOk || !refusedLedgerOk || !resolvedLedgerOk || !chainOk) {
  throw new Error("INGRESS_LEDGER_V1_FAILED");
}

console.log("INGRESS_LEDGER_V1=PASS");
console.log("INGRESS_LEDGER_V1=COMPLETE");
