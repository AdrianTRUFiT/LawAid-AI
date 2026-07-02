import crypto from 'crypto';
import { appendLedger, checkReplay } from './truth-ledger';

type EligibilityInput = {
  artifactId: string;
  stage: string;
  lineageProof: string;
  eligibilityProof?: string;
  driftClassification?: string;
  payload?: any;
  previousState?: string;
  dependencyHash?: string;
  expectedDependencyHash?: string;
  timestamp: number;
};

type EligibilityResult =
  | { decision: "CONTINUE"; reason: "ELIGIBILITY_PROVEN" }
  | { decision: "HELD"; reason: "REVALIDATION_REQUIRED"; drift: string }
  | { decision: "BLOCKED"; reason: string };

function hashPayload(payload: any): string {
  return crypto.createHash('sha256')
    .update(JSON.stringify(payload || {}))
    .digest('hex');
}

export function evaluateEligibility(input: EligibilityInput): EligibilityResult {

  const payloadHash = hashPayload(input.payload);

  // ?? NO PROOF
  if (!input.eligibilityProof && !input.driftClassification) {
    appendLedger({
      artifactId: input.artifactId,
      action: "BLOCKED",
      reason: "NO_PROOF"
    });
    return { decision: "BLOCKED", reason: "ELIGIBILITY_REVOKED" };
  }

  // ?? DRIFT
  if (input.driftClassification) {
    appendLedger({
      artifactId: input.artifactId,
      action: "HELD",
      drift: input.driftClassification
    });

    return {
      decision: "HELD",
      reason: "REVALIDATION_REQUIRED",
      drift: input.driftClassification
    };
  }

  // ?? REPLAY (PERSISTENT)
  if (checkReplay(input.artifactId, payloadHash)) {
    appendLedger({
      artifactId: input.artifactId,
      action: "BLOCKED",
      reason: "REPLAY_MUTATION",
      payloadHash
    });

    return {
      decision: "BLOCKED",
      reason: "REPLAY_MUTATION_DETECTED"
    };
  }

  // ?? POST-REVIEW MUTATION
  if (input.previousState === "HELD" && input.eligibilityProof === "VALID") {
    appendLedger({
      artifactId: input.artifactId,
      action: "BLOCKED",
      reason: "POST_REVIEW_MUTATION"
    });

    return {
      decision: "BLOCKED",
      reason: "POST_REVIEW_MUTATION"
    };
  }

  // ?? CROSS-ARTIFACT
  if (
    input.dependencyHash &&
    input.expectedDependencyHash &&
    input.dependencyHash !== input.expectedDependencyHash
  ) {
    appendLedger({
      artifactId: input.artifactId,
      action: "BLOCKED",
      reason: "CROSS_ARTIFACT_INCONSISTENCY"
    });

    return {
      decision: "BLOCKED",
      reason: "CROSS_ARTIFACT_INCONSISTENCY"
    };
  }

  // ? FINAL PASS
  if (input.eligibilityProof === "VALID") {
    appendLedger({
      artifactId: input.artifactId,
      action: "CONTINUE",
      payloadHash
    });

    return {
      decision: "CONTINUE",
      reason: "ELIGIBILITY_PROVEN"
    };
  }

  return {
    decision: "BLOCKED",
    reason: "ELIGIBILITY_REVOKED"
  };
}
