export type DecisionBindingInput = {
  decisionId: string;
  artifactId: string;
  decisionArtifactId: string;
  decisionTimestamp: number;
  currentTimestamp: number;
  maxAgeMs: number;
  superseded: boolean;
  contextHashAtDecision: string;
  currentContextHash: string;
  dependenciesHashAtDecision: string;
  currentDependenciesHash: string;
};

export function evaluateDecisionBinding(input: DecisionBindingInput) {
  if (!input.decisionId) {
    return {
      decision: "REFUSE",
      reason: "DECISION_ID_REQUIRED"
    };
  }

  if (input.artifactId !== input.decisionArtifactId) {
    return {
      decision: "REFUSE",
      reason: "DECISION_ARTIFACT_MISMATCH"
    };
  }

  if (input.superseded) {
    return {
      decision: "REFUSE",
      reason: "DECISION_SUPERSEDED"
    };
  }

  if (input.currentTimestamp - input.decisionTimestamp > input.maxAgeMs) {
    return {
      decision: "REFUSE",
      reason: "DECISION_STALE"
    };
  }

  if (input.contextHashAtDecision !== input.currentContextHash) {
    return {
      decision: "REFUSE",
      reason: "CONTEXT_DRIFT"
    };
  }

  if (input.dependenciesHashAtDecision !== input.currentDependenciesHash) {
    return {
      decision: "REFUSE",
      reason: "DEPENDENCY_DRIFT"
    };
  }

  return {
    decision: "ALLOW",
    reason: "DECISION_RUNTIME_BINDING_VERIFIED"
  };
}
