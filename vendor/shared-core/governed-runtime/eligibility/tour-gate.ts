import crypto from 'crypto';
import { enforceEligibility } from './enforce-eligibility';

type TOURInput = {
  artifactId: string;
  stage: string;
  lineageProof: string;
  eligibilityProof?: string;
  payload?: any;
  dependencyHash?: string;
  expectedDependencyHash?: string;
  lastVerifiedAt?: number;
  timestamp: number;
};

function hashPayload(payload: any): string {
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload || {}))
    .digest('hex');
}

export function tourGate(input: TOURInput) {

  // ?? STEP 1: RE-RUN ELIGIBILITY (NON-NEGOTIABLE)
  const base = enforceEligibility(input);

  if (base.status === "HELD") {
    return {
      state: "EXECUTION_HELD",
      reason: base.reason,
      drift: base.drift
    };
  }

  // ?? STEP 2: TIME FRESHNESS CHECK
  const MAX_AGE_MS = 60 * 1000; // 60 seconds (tunable)

  if (input.lastVerifiedAt) {
    const age = Date.now() - input.lastVerifiedAt;

    if (age > MAX_AGE_MS) {
      return {
        state: "EXECUTION_BLOCKED",
        reason: "STALE_VERIFICATION",
        age
      };
    }
  }

  // ?? STEP 3: DEPENDENCY RE-CHECK
  if (
    input.dependencyHash &&
    input.expectedDependencyHash &&
    input.dependencyHash !== input.expectedDependencyHash
  ) {
    return {
      state: "EXECUTION_BLOCKED",
      reason: "DEPENDENCY_DRIFT"
    };
  }

  // ?? STEP 4: PAYLOAD INTEGRITY SNAPSHOT
  const payloadHash = hashPayload(input.payload);

  return {
    state: "EXECUTION_ALLOWED",
    artifactId: input.artifactId,
    payloadHash,
    executedAt: Date.now()
  };
}
