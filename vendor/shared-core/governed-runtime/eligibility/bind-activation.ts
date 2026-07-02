import { enforceEligibility } from './enforce-eligibility';

export function activationGate(input: any) {
  const result = enforceEligibility(input);

  if (result.status === "HELD") {
    return {
      state: "HELD:REVALIDATION_REQUIRED",
      reason: result.reason,
      drift: result.drift
    };
  }

  return {
    state: "ACTIVATION_ALLOWED"
  };
}
