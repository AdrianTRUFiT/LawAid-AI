import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";

const defs = buildSoul256Definitions();
const engine = new Soul256Engine(defs);

const sinkGate = defs.find((d) => d.kind === "sink_gate");
if (!sinkGate) {
  console.error("MISSING_SINK_GATE");
  process.exit(1);
}

const session = createSoul256Session({
  identityId: "identity_demo_sink_001",
  environmentId: "lawaidai_trial_to_paid",
  definitions: defs,
});

// Advance up to the sink gate using the real route/carrier.
for (const def of defs) {
  if (def.sequence > sinkGate.sequence) {
    break;
  }

  const useWrongCarrier = def.checkpointId === sinkGate.checkpointId;
  const result = engine.advance(session, {
    checkpointId: def.checkpointId,
    carrierId: useWrongCarrier ? session.decoyCarrierIds[0] : session.realCarrierId,
    routeId: session.realRouteId,
  });

  if (def.checkpointId === sinkGate.checkpointId) {
    if (result.ok) {
      console.error("SINK_GATE_SHOULD_FAIL");
      process.exit(1);
    }
    if (result.reasonCode !== "SINK_TRIGGERED") {
      console.error("SINK_GATE_WRONG_REASON");
      console.error("ACTUAL=", result.reasonCode);
      process.exit(1);
    }
    break;
  }

  if (!result.ok) {
    console.error("SINK_TEST_SETUP_FAILED_AT=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }
}

if (!session.trapped || session.trapCheckpointId !== sinkGate.checkpointId) {
  console.error("SESSION_SHOULD_BE_TRAPPED");
  process.exit(1);
}

const consequence = engine.assertConsequenceAuthorized(session);
if (consequence.ok) {
  console.error("TRAPPED_SESSION_SHOULD_NOT_AUTHORIZE_CONSEQUENCE");
  process.exit(1);
}

const blockedAfterTrap = engine.advance(session, {
  checkpointId: `cp_${(sinkGate.sequence + 1).toString().padStart(3, "0")}`,
  carrierId: session.realCarrierId,
  routeId: session.realRouteId,
});

if (blockedAfterTrap.ok) {
  console.error("POST_TRAP_PROGRESS_SHOULD_BE_BLOCKED");
  process.exit(1);
}

if (blockedAfterTrap.reasonCode !== "SESSION_TRAPPED") {
  console.error("POST_TRAP_WRONG_REASON");
  console.error("ACTUAL=", blockedAfterTrap.reasonCode);
  process.exit(1);
}

const reconciliation = engine.reconcile(session);
if (reconciliation.ok) {
  console.error("TRAPPED_SESSION_RECONCILIATION_SHOULD_FAIL");
  process.exit(1);
}

console.log("SOUL256_SINK_STATUS=PASS");
console.log("SINK_GATE_ID=", sinkGate.checkpointId);
console.log("TRAPPED=", session.trapped);
console.log("TRAP_CHECKPOINT=", session.trapCheckpointId);
console.log("RECONCILIATION_OK=", reconciliation.ok);
