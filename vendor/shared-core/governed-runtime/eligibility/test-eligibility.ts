import { evaluateEligibility } from './evaluate-eligibility';

const cases = [
  {
    name: "VALID_ELIGIBILITY",
    input: {
      artifactId: "A1",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      eligibilityProof: "VALID",
      timestamp: Date.now()
    }
  },
  {
    name: "DRIFT_PRESENT",
    input: {
      artifactId: "A2",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      driftClassification: "LINEAGE_MISMATCH",
      timestamp: Date.now()
    }
  },
  {
    name: "NO_PROOF_NO_DRIFT",
    input: {
      artifactId: "A3",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      timestamp: Date.now()
    }
  }
];

for (const c of cases) {
  const result = evaluateEligibility(c.input as any);
  console.log("----");
  console.log(c.name);
  console.log(result);
}
