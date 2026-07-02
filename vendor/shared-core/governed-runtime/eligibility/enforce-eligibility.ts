import { evaluateEligibility, EligibilityInput } from './evaluate-eligibility';

export function enforceEligibility(input: EligibilityInput) {
  const result = evaluateEligibility(input);

  if (result.decision === "BLOCKED") {
    throw new Error(
      "ELIGIBILITY_BLOCKED: " + result.reason
    );
  }

  if (result.decision === "HELD") {
    return {
      status: "HELD",
      reason: result.reason,
      drift: result.drift
    };
  }

  return {
    status: "CONTINUE",
    reason: result.reason
  };
}
