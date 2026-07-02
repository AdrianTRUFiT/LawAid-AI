import { runVerificationAdmissions } from "../src/index.js";

const result = runVerificationAdmissions({
  envelopeId: "env_warn_001",
  sourceId: "feed_warn_001",
  sourceClass: "live",
  dataShapeClass: "movement",
  receivedAt: new Date().toISOString(),
  payload: {
    subjectId: "asset_warn_001",
    stateLabel: "early_descent",
    direction: "unknownish",
    magnitude: 1.0,
    ageBars: 3,
    timestamp: new Date().toISOString(),
  },
});

if (
  !result.admissionDecision.admitted ||
  result.trustClassification?.trustClass !== "conditionally_trusted"
) {
  throw new Error("Expected warning downgrade to conditional trust.");
}

console.log("SMOKE_VERIFICATION_ADMISSIONS_WARNING_DOWNGRADE=PASS");