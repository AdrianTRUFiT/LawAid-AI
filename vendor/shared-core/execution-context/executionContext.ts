export type ContextInput = {
  artifactId: string;
  lastVerifiedAt: number;
  currentTime: number;
  dependenciesValid: boolean;
  sequenceValid: boolean;
  driftDetected?: boolean;
};

export type ContextResult =
  | { decision: "EXECUTE"; reason: "CONTEXT_VALID" }
  | { decision: "HOLD"; reason: "STALE_OR_DRIFT"; detail: string }
  | { decision: "BLOCK"; reason: "DEPENDENCY_OR_SEQUENCE_INVALID" };

export function evaluateExecutionContext(input: ContextInput): ContextResult {
  const timeDelta = input.currentTime - input.lastVerifiedAt;

  if (!input.dependenciesValid || !input.sequenceValid) {
    return {
      decision: "BLOCK",
      reason: "DEPENDENCY_OR_SEQUENCE_INVALID"
    };
  }

  if (input.driftDetected) {
    return {
      decision: "HOLD",
      reason: "STALE_OR_DRIFT",
      detail: "DRIFT_DETECTED"
    };
  }

  if (timeDelta > 60000) {
    return {
      decision: "HOLD",
      reason: "STALE_OR_DRIFT",
      detail: "STALE_CONTEXT"
    };
  }

  return {
    decision: "EXECUTE",
    reason: "CONTEXT_VALID"
  };
}
