import { lawAidWriteGate } from './lawaid-binding';

const test = {
  artifactId: "A_HELD",
  stage: "Reviewed",
  lineageProof: "hash123",
  eligibilityProof: "VALID",
  previousState: "HELD",
  payload: { amount: 100 },
  timestamp: Date.now()
};

try {
  const res = lawAidWriteGate(test);
  console.log(res);
} catch (e: any) {
  console.log("BLOCKED:", e.message);
}
