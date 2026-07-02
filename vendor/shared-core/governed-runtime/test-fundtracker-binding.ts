import { fundTrackerActivation } from './fundtracker-binding';

const test = {
  artifactId: "A_REPLAY",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  payload: { amount: 9999 },
  timestamp: Date.now()
};

try {
  const res = fundTrackerActivation(test);
  console.log(res);
} catch (e: any) {
  console.log("BLOCKED:", e.message);
}
