import { createSoul256Session } from "../lib/soul256/soul256Assignment";
import { buildSoul256Definitions } from "../lib/soul256/soul256Definitions";
import { Soul256Engine } from "../lib/soul256/soul256Engine";

const defs = buildSoul256Definitions();
const engine = new Soul256Engine(defs);

const session = createSoul256Session({
  identityId: "identity_demo_negative_001",
  environmentId: "lawaidai_trial_to_paid",
  definitions: defs,
});

// Step 1 should pass with the real carrier and route.
const first = engine.advance(session, {
  checkpointId: "cp_001",
  carrierId: session.realCarrierId,
  routeId: session.realRouteId,
});

if (!first.ok) {
  console.error("NEGATIVE_TEST_SETUP_FAILED_AT=cp_001");
  console.error("REASON=", first.reasonCode);
  process.exit(1);
}

// Step 2 should fail with the wrong carrier.
const wrongCarrier =
  session.decoyCarrierIds.find((x) => x !== session.realCarrierId) ?? "carrier_999";

const broken = engine.advance(session, {
  checkpointId: "cp_002",
  carrierId: wrongCarrier,
  routeId: session.realRouteId,
});

if (broken.ok) {
  console.error("NEGATIVE_TEST_FAILED");
  console.error("EXPECTED_FAILURE_AT=cp_002");
  console.error("ACTUAL_STATUS=", broken.status);
  process.exit(1);
}

if (broken.reasonCode !== "CHAIN_CONTINUITY_MISMATCH") {
  console.error("NEGATIVE_TEST_WRONG_REASON");
  console.error("EXPECTED=CHAIN_CONTINUITY_MISMATCH");
  console.error("ACTUAL=", broken.reasonCode);
  process.exit(1);
}

const cp002 = session.checkpoints.find((c) => c.checkpointId === "cp_002");
if (!cp002 || cp002.status !== "failed") {
  console.error("NEGATIVE_TEST_WRONG_CHECKPOINT_STATE");
  console.error("EXPECTED=failed");
  console.error("ACTUAL=", cp002?.status);
  process.exit(1);
}

// Step 3 should now be blocked because cp_002 failed.
const blocked = engine.advance(session, {
  checkpointId: "cp_003",
  carrierId: session.realCarrierId,
  routeId: session.realRouteId,
});

if (blocked.ok) {
  console.error("NEGATIVE_TEST_BLOCK_FAILED");
  console.error("EXPECTED_BLOCK_AT=cp_003");
  process.exit(1);
}

if (blocked.reasonCode !== "DEPENDENCY_NOT_SATISFIED") {
  console.error("NEGATIVE_TEST_BLOCK_WRONG_REASON");
  console.error("EXPECTED=DEPENDENCY_NOT_SATISFIED");
  console.error("ACTUAL=", blocked.reasonCode);
  process.exit(1);
}

const reconciliation = engine.reconcile(session);

if (reconciliation.ok) {
  console.error("NEGATIVE_TEST_RECONCILIATION_SHOULD_FAIL");
  console.error(JSON.stringify(reconciliation, null, 2));
  process.exit(1);
}

console.log("SOUL256_NEGATIVE_STATUS=PASS");
console.log("FAILED_CHECKPOINT=", broken.checkpointId);
console.log("FAILED_REASON=", broken.reasonCode);
console.log("BLOCKED_CHECKPOINT=", blocked.checkpointId);
console.log("BLOCKED_REASON=", blocked.reasonCode);
console.log("RECONCILIATION_OK=", reconciliation.ok);
console.log("PASSED_REQUIRED=", reconciliation.passedRequired);
console.log("TOTAL_REQUIRED=", reconciliation.totalRequired);
console.log("COMPLETE=", session.complete);
