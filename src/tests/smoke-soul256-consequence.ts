import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";

const defs = buildSoul256Definitions();
const engine = new Soul256Engine(defs);

const consequenceGate = defs.find((d) => d.kind === "consequence_gate");
if (!consequenceGate) {
  console.error("MISSING_CONSEQUENCE_GATE");
  process.exit(1);
}

const session = createSoul256Session({
  identityId: "identity_demo_consequence_001",
  environmentId: "lawaidai_trial_to_paid",
  definitions: defs,
});

// Before consequence gate passes, consequence must be unauthorized.
const before = engine.assertConsequenceAuthorized(session);
if (before.ok) {
  console.error("CONSEQUENCE_SHOULD_NOT_BE_UNLOCKED_BEFORE_GATE");
  process.exit(1);
}

// Advance up to the checkpoint immediately before the consequence gate.
for (const def of defs) {
  if (def.sequence >= consequenceGate.sequence) {
    break;
  }

  const result = engine.advance(session, {
    checkpointId: def.checkpointId,
    carrierId: session.realCarrierId,
    routeId: session.realRouteId,
  });

  if (!result.ok && result.reasonCode !== "ALREADY_PASSED") {
    console.error("FAILED_BEFORE_CONSEQUENCE_GATE=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }
}

const stillBefore = engine.assertConsequenceAuthorized(session);
if (stillBefore.ok) {
  console.error("CONSEQUENCE_UNLOCKED_TOO_EARLY");
  process.exit(1);
}

// Advance the actual consequence gate.
const gateResult = engine.advance(session, {
  checkpointId: consequenceGate.checkpointId,
  carrierId: session.realCarrierId,
  routeId: session.realRouteId,
});

if (!gateResult.ok) {
  console.error("CONSEQUENCE_GATE_FAILED");
  console.error("REASON=", gateResult.reasonCode);
  process.exit(1);
}

const after = engine.assertConsequenceAuthorized(session);
if (!after.ok) {
  console.error("CONSEQUENCE_NOT_UNLOCKED_AFTER_GATE");
  console.error("REASON=", after.reasonCode);
  process.exit(1);
}

// Finish remaining checkpoints and reconcile.
for (const def of defs) {
  if (def.sequence <= consequenceGate.sequence) {
    continue;
  }

  const result = engine.advance(session, {
    checkpointId: def.checkpointId,
    carrierId: session.realCarrierId,
    routeId: session.realRouteId,
  });

  if (!result.ok && result.reasonCode !== "ALREADY_PASSED") {
    console.error("FAILED_AFTER_CONSEQUENCE_GATE=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }
}

const reconciliation = engine.reconcile(session);
if (!reconciliation.ok) {
  console.error("RECONCILIATION_FAILED_AFTER_CONSEQUENCE_TEST");
  console.error(JSON.stringify(reconciliation, null, 2));
  process.exit(1);
}

console.log("SOUL256_CONSEQUENCE_STATUS=PASS");
console.log("CONSEQUENCE_GATE_ID=", consequenceGate.checkpointId);
console.log("UNLOCKED=", session.consequenceUnlocked);
console.log("UNLOCKED_AT=", session.consequenceCheckpointId);
console.log("COMPLETE=", session.complete);
