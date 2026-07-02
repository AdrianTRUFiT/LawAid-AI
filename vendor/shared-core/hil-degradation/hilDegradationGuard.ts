import type {
  HilDegradationInput,
  HilDegradationResult
} from "./hilDegradationContracts";

export function evaluateHilDegradation(
  input: HilDegradationInput = {}
): HilDegradationResult {
  if (input.blocked === true) {
    return {
      decision: "BLOCK",
      reasonCode: input.reasonCode ?? "HIL_BLOCKED",
      requiresHumanReview: true
    };
  }

  if (input.hold === true) {
    return {
      decision: "HOLD",
      reasonCode: input.reasonCode ?? "HIL_HOLD",
      requiresHumanReview: true
    };
  }

  return {
    decision: "ALLOW",
    reasonCode: input.reasonCode ?? "NO_DEGRADATION",
    requiresHumanReview: false
  };
}

export function hilDegradationGuard(
  input: HilDegradationInput = {}
): HilDegradationResult {
  return evaluateHilDegradation(input);
}
