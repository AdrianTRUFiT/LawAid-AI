import { runVerificationAdmissions } from "../src/index.js";

const result = runVerificationAdmissions({
  envelopeId: "env_live_001",
  sourceId: "feed_live_001",
  sourceClass: "live",
  dataShapeClass: "movement",
  receivedAt: new Date().toISOString(),
  payload: {
    subjectId: "asset_001",
    stateLabel: "early_ascent",
    direction: "up",
    magnitude: 2.5,
    ageBars: 4,
    timestamp: new Date().toISOString(),
  },
});

if (
  !result.admissionDecision.admitted ||
  result.trustClassification?.trustClass !== "production_trusted"
) {
  throw new Error("Expected live input admission.");
}

console.log("SMOKE_VERIFICATION_ADMISSIONS_LIVE=PASS");