import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";

const defs = buildSoul256Definitions();
const engine = new Soul256Engine(defs);

const decoyGate = defs.find((d) => d.kind === "decoy_gate");
if (!decoyGate) {
  console.error("MISSING_DECOY_GATE");
  process.exit(1);
}

const session = createSoul256Session({
  identityId: "identity_demo_decoy_001",
  environmentId: "lawaidai_trial_to_paid",
  definitions: defs,
});

// Advance up to the first decoy gate using the real route/carrier.
for (const def of defs) {
  if (def.sequence > decoyGate.sequence) {
    break;
  }

  const useDecoyCarrier = def.checkpointId === decoyGate.checkpointId;
  const result = engine.advance(session, {
    checkpointId: def.checkpointId,
    carrierId: useDecoyCarrier ? session.decoyCarrierIds[0] : session.realCarrierId,
    routeId: session.realRouteId,
  });

  if (!result.ok) {
    console.error("DECOY_TEST_FAILED_AT=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }
}

const decoyState = session.checkpoints.find((c) => c.checkpointId === decoyGate.checkpointId);
if (!decoyState || decoyState.status !== "passed") {
  console.error("DECOY_GATE_NOT_PASSED");
  process.exit(1);
}

if (decoyState.reasonCode !== "DECOY_DIVERTED" && decoyState.reasonCode !== "DECOY_VALID") {
  console.error("DECOY_GATE_WRONG_REASON");
  console.error("ACTUAL=", decoyState.reasonCode);
  process.exit(1);
}

if (session.trapped) {
  console.error("DECOY_GATE_SHOULD_NOT_TRAP_SESSION");
  process.exit(1);
}

console.log("SOUL256_DECOY_STATUS=PASS");
console.log("DECOY_GATE_ID=", decoyGate.checkpointId);
console.log("DECOY_REASON=", decoyState.reasonCode);
console.log("TRAPPED=", session.trapped);
