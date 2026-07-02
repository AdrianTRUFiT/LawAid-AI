import { activationGate } from './bind-activation';

const test = {
  artifactId: "A_BLOCK",
  stage: "VerifiedOpportunity",
  lineageProof: "hash123",
  timestamp: Date.now()
};

try {
  const res = activationGate(test);
  console.log(res);
} catch (e: any) {
  console.log("ACTIVATION BLOCKED:", e.message);
}
