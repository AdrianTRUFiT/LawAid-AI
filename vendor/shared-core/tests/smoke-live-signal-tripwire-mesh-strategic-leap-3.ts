import {
  evaluateLiveSignalTripwireMesh,
  LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE
} from "../live-signal-tripwire-mesh";
import type { TripwireSignal } from "../live-signal-tripwire-mesh";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function sig(
  id: string,
  seam: TripwireSignal["seam"],
  signalClass: TripwireSignal["signalClass"],
  severity: TripwireSignal["severity"],
  actualSignal: boolean,
  forecastOnly: boolean
): TripwireSignal {
  return {
    signalId: id,
    transactionRef: "txn_leap3_001",
    seam,
    signalClass,
    severity,
    observedAt: "2026-04-28T15:00:00.000Z",
    actualSignal,
    forecastOnly,
    evidenceRef: `evidence_${id}`,
    summary: `${signalClass} observed at ${seam}`,
    boundary: {
      signalIsNotPaymentAuthority: true,
      signalIsNotTransactionTruth: true,
      signalIsNotCustodyTransfer: true,
      signalIsNotRuntimeActivation: true
    }
  };
}

assert(LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE.boundary.tripwireMeshIsNotPaymentAuthority === true, "Tripwire mesh is not payment authority");
assert(LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE.boundary.tripwireMeshIsNotTransactionTruth === true, "Tripwire mesh is not transaction truth");
assert(LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE.boundary.forecastIsNotEvidence === true, "Forecast is not evidence");
assert(LIVE_SIGNAL_TRIPWIRE_MESH_DOCTRINE.boundary.actualSignalRequiredForHoldOrRefusal === true, "Actual signal required for hold or refusal");

const forecastOnly = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("forecast_001", "PREDICTIVE_FIREWALL", "FORECAST_ONLY", "HIGH", false, true),
    sig("forecast_002", "PREDICTIVE_FIREWALL", "FORECAST_ONLY", "HIGH", false, true)
  ],
  "2026-04-28T15:00:01.000Z"
);

assert(forecastOnly.route === "WATCH", "Forecast-only signals route to watch");
assert(forecastOnly.refusalReasons.includes("FORECAST_ONLY_CANNOT_REFUSE"), "Forecast-only cannot refuse present");
assert(forecastOnly.boundary.predictionCannotRefuseTransactionAlone === true, "Prediction cannot refuse alone");

const singleActual = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("actual_001", "PAI_SAFE", "STATUS_MISMATCH", "MEDIUM", true, false)
  ],
  "2026-04-28T15:00:02.000Z"
);

assert(singleActual.route === "WATCH", "Single non-critical actual signal routes to watch");
assert(singleActual.clusters.length === 1, "Single actual signal creates one cluster");

const multiSeam = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("boundary_001", "PAI_SAFE", "BOUNDARY_DOWNGRADE", "HIGH", true, false),
    sig("boundary_002", "HUMAN_REVIEW", "BOUNDARY_DOWNGRADE", "HIGH", true, false)
  ],
  "2026-04-28T15:00:03.000Z"
);

assert(multiSeam.route === "CRITICAL_ESCALATION", "Boundary downgrade severity escalates");
assert(multiSeam.refusalReasons.includes("BOUNDARY_DOWNGRADE_DETECTED"), "Boundary downgrade detected");
assert(multiSeam.boundary.meshIsNotTransactionTruth === true, "Escalation creates no transaction truth");

const replayMultiSeam = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("replay_001", "SOULREGISTRY", "REPLAY_PRESSURE", "HIGH", true, false),
    sig("replay_002", "PROJECTION_LEDGER", "REPLAY_PRESSURE", "HIGH", true, false)
  ],
  "2026-04-28T15:00:04.000Z"
);

assert(replayMultiSeam.route === "MACHINE_HOLD", "Replay pressure across seams creates machine hold");
assert(replayMultiSeam.refusalReasons.includes("MULTI_SEAM_PRE_BREACH_DETECTED"), "Multi-seam pre-breach detected");
assert(replayMultiSeam.refusalReasons.includes("REPLAY_PRESSURE_DETECTED"), "Replay pressure detected");

const synthetic = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("synthetic_001", "CONSEQUENCE_INTELLIGENCE", "SYNTHETIC_AUTHORITY", "CRITICAL", true, false)
  ],
  "2026-04-28T15:00:05.000Z"
);

assert(synthetic.route === "INSTANT_REFUSE", "Synthetic authority instantly refused");
assert(synthetic.status === "TRIPWIRE_MESH_REFUSED", "Synthetic authority status refused");
assert(synthetic.refusalReasons.includes("SYNTHETIC_AUTHORITY_REFUSED"), "Synthetic authority refusal present");

const proofHealth = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("proof_001", "PROJECTION_LEDGER", "PROOF_HEALTH_DEGRADATION", "HIGH", true, false),
    sig("proof_002", "SOULREGISTRY", "PROOF_HEALTH_DEGRADATION", "HIGH", true, false),
    sig("proof_003", "CONSEQUENCE_INTELLIGENCE", "PROOF_HEALTH_DEGRADATION", "HIGH", true, false)
  ],
  "2026-04-28T15:00:06.000Z"
);

assert(proofHealth.route === "MACHINE_HOLD", "Proof health degradation across seams creates hold");
assert(proofHealth.refusalReasons.includes("PROOF_HEALTH_DEGRADED"), "Proof health degraded refusal present");


const authorityConfusion = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("authority_001", "PROCESSOR", "AUTHORITY_CONFUSION", "HIGH", true, false),
    sig("authority_002", "PAI_SAFE", "AUTHORITY_CONFUSION", "HIGH", true, false)
  ],
  "2026-04-28T15:00:07.000Z"
);

assert(authorityConfusion.route === "CRITICAL_ESCALATION", "Authority confusion escalates as authority attack class");
assert(authorityConfusion.refusalReasons.includes("AUTHORITY_CONFUSION_DETECTED"), "Authority confusion detected");

const leakageEscalation = evaluateLiveSignalTripwireMesh(
  "txn_leap3_001",
  [
    sig("leakage_001", "SOULREGISTRY", "PUBLIC_PRIVATE_LEAKAGE", "HIGH", true, false),
    sig("leakage_002", "PROJECTION_LEDGER", "PUBLIC_PRIVATE_LEAKAGE", "HIGH", true, false)
  ],
  "2026-04-28T15:00:08.000Z"
);

assert(leakageEscalation.route === "CRITICAL_ESCALATION", "Public/private leakage escalates as authority attack class");
assert(leakageEscalation.refusalReasons.includes("PUBLIC_PRIVATE_LEAKAGE_DETECTED"), "Public/private leakage detected");

const everyDecisionPreservesBoundary = [forecastOnly, singleActual, multiSeam, replayMultiSeam, synthetic, proofHealth, authorityConfusion, leakageEscalation].every(
  (decision) =>
    decision.boundary.meshIsNotPaymentAuthority === true &&
    decision.boundary.meshIsNotTransactionTruth === true &&
    decision.boundary.meshIsNotCustodyTransfer === true &&
    decision.boundary.meshIsNotRuntimeActivation === true &&
    decision.boundary.fundTrackerAIRemainsTransactionTruth === true
);

assert(everyDecisionPreservesBoundary === true, "Every tripwire decision preserves non-authority boundaries");

console.log("");
console.log("LIVE_SIGNAL_TRIPWIRE_MESH_STRATEGIC_LEAP_3_SMOKE=PASS");

