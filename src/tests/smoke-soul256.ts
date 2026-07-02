import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";

const defs = buildSoul256Definitions();
const engine = new Soul256Engine(defs);

const session = createSoul256Session({
  identityId: "identity_demo_001",
  environmentId: "lawaidai_trial_to_paid",
  definitions: defs,
});

for (const def of defs) {
  const result = engine.advance(session, {
    checkpointId: def.checkpointId,
    carrierId: session.realCarrierId,
    routeId: session.realRouteId,
  });

  if (!result.ok && result.reasonCode !== "ALREADY_PASSED") {
    console.error("FAILED_AT=", def.checkpointId);
    console.error("REASON=", result.reasonCode);
    process.exit(1);
  }
}

const reconciliation = engine.reconcile(session);

if (!reconciliation.ok) {
  console.error("RECONCILIATION_FAILED");
  console.error(JSON.stringify(reconciliation, null, 2));
  process.exit(1);
}

console.log("SOUL256_STATUS=PASS");
console.log("SESSION_ID=", session.sessionId);
console.log("REAL_CARRIER=", session.realCarrierId);
console.log("REAL_ROUTE=", session.realRouteId);
console.log("CHECKPOINTS_TOTAL=", session.checkpoints.length);
console.log("ARTIFACTS_TOTAL=", session.artifacts.length);
console.log("COMPLETE=", session.complete);
