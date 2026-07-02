import { runVerificationAdmissions } from "../src/index.js";

const result = runVerificationAdmissions({
  envelopeId: "env_q_001",
  sourceId: "feed_q_001",
  sourceClass: "operator",
  dataShapeClass: "movement",
  receivedAt: new Date().toISOString(),
  payload: {
    subjectId: "asset_q_001",
    stateLabel: "mid_ascent",
    direction: "up",
    magnitude: 1.2,
    ageBars: -5,
    timestamp: new Date().toISOString(),
  },
});

if (
  result.admissionDecision.status !== "QUARANTINED" ||
  result.trustClassification?.trustClass !== "quarantined"
) {
  throw new Error("Expected quarantine.");
}

console.log("SMOKE_VERIFICATION_ADMISSIONS_QUARANTINE=PASS");