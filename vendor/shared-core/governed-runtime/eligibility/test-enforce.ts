import { enforceEligibility } from './enforce-eligibility';

const tests = [
  {
    name: "VALID",
    input: {
      artifactId: "A1",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      eligibilityProof: "VALID",
      timestamp: Date.now()
    }
  },
  {
    name: "DRIFT",
    input: {
      artifactId: "A2",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      driftClassification: "LINEAGE_MISMATCH",
      timestamp: Date.now()
    }
  },
  {
    name: "BLOCK",
    input: {
      artifactId: "A3",
      stage: "VerifiedOpportunity",
      lineageProof: "hash123",
      timestamp: Date.now()
    }
  }
];

for (const t of tests) {
  try {
    const res = enforceEligibility(t.input as any);
    console.log("----");
    console.log(t.name);
    console.log(res);
  } catch (e: any) {
    console.log("----");
    console.log(t.name);
    console.log("ERROR:", e.message);
  }
}
