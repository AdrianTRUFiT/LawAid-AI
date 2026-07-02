import { evaluateExecutionContext } from './executionContext';

const now = Date.now();

const cases = [
  {
    name: "VALID_CONTEXT",
    input: {
      artifactId: "A1",
      lastVerifiedAt: now - 1000,
      currentTime: now,
      dependenciesValid: true,
      sequenceValid: true
    }
  },
  {
    name: "STALE_CONTEXT",
    input: {
      artifactId: "A2",
      lastVerifiedAt: now - 120000,
      currentTime: now,
      dependenciesValid: true,
      sequenceValid: true
    }
  },
  {
    name: "DRIFT_CONTEXT",
    input: {
      artifactId: "A3",
      lastVerifiedAt: now - 1000,
      currentTime: now,
      dependenciesValid: true,
      sequenceValid: true,
      driftDetected: true
    }
  },
  {
    name: "DEPENDENCY_FAIL",
    input: {
      artifactId: "A4",
      lastVerifiedAt: now - 1000,
      currentTime: now,
      dependenciesValid: false,
      sequenceValid: true
    }
  }
];

console.log("EXECUTION_CONTEXT_V1=START");

for (const c of cases) {
  console.log("----");
  console.log(c.name);
  console.log(evaluateExecutionContext(c.input as any));
}

console.log("EXECUTION_CONTEXT_V1=COMPLETE");
