import { enforceEligibility } from './enforce-eligibility';

function runTest(name: string, input: any) {
  try {
    const res = enforceEligibility(input);
    console.log("----");
    console.log(name);
    console.log("RESULT:", res);
  } catch (e: any) {
    console.log("----");
    console.log(name);
    console.log("ERROR:", e.message);
  }
}

// 1. LINEAGE MISMATCH
runTest("LINEAGE_MISMATCH", {
  artifactId: "A1",
  stage: "VerifiedOpportunity",
  lineageProof: "hash_ORIGINAL",
  eligibilityProof: "VALID_BUT_WRONG_SOURCE",
  payload: { amount: 100 },
  timestamp: Date.now()
});

// 2. REPLAY WITH MODIFIED PAYLOAD
runTest("REPLAY_MUTATION_FIRST", {
  artifactId: "A_REPLAY",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  payload: { amount: 100 },
  timestamp: Date.now()
});

runTest("REPLAY_MUTATION_SECOND", {
  artifactId: "A_REPLAY",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  payload: { amount: 9999 }, // ?? mutation
  timestamp: Date.now()
});

// 3. POST-REVIEW MUTATION
runTest("POST_REVIEW_MUTATION", {
  artifactId: "A_HELD",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  previousState: "HELD", // ?? required trigger
  payload: { amount: 100 },
  timestamp: Date.now()
});

// 4. CROSS-ARTIFACT DRIFT
runTest("CROSS_ARTIFACT_DRIFT", {
  artifactId: "A1",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  dependencyHash: "hash_A",
  expectedDependencyHash: "hash_B", // ?? mismatch
  payload: { amount: 100 },
  timestamp: Date.now()
});
