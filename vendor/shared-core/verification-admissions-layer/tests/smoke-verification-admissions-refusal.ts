import { runVerificationAdmissions } from "../src/index.js";

const result = runVerificationAdmissions({
  envelopeId: "env_bad_001",
  sourceId: "feed_bad_001",
  sourceClass: "external_feed",
  dataShapeClass: "movement",
  receivedAt: new Date().toISOString(),
  payload: {
    subjectId: "bad_asset_001",
    direction: "up",
    magnitude: 1.1
  },
});

if (
  result.admissionDecision.status !== "REFUSED" ||
  result.schemaConformance.conforms !== false
) {
  throw new Error("Expected schema refusal.");
}

console.log("SMOKE_VERIFICATION_ADMISSIONS_REFUSAL=PASS");