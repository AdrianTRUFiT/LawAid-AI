import { runVerificationAdmissions } from "../src/index.js";

const result = runVerificationAdmissions({
  envelopeId: "env_syn_001",
  sourceId: "feed_syn_001",
  sourceClass: "synthetic",
  dataShapeClass: "movement",
  receivedAt: new Date().toISOString(),
  payload: {
    subjectId: "sim_asset_001",
    stateLabel: "neutral_compression",
    direction: "neutral",
    magnitude: 0.4,
    ageBars: 12,
    timestamp: new Date().toISOString(),
  },
});

if (
  !result.admissionDecision.admitted ||
  result.trustClassification?.trustClass !== "synthetic_only" ||
  result.trustClassification.productionEligible !== false
) {
  throw new Error("Expected synthetic processability with synthetic-only trust.");
}

console.log("SMOKE_VERIFICATION_ADMISSIONS_SYNTHETIC=PASS");