import { enforceEligibility } from './eligibility/enforce-eligibility';

export function fundTrackerActivation(input: any) {

  const gate = enforceEligibility(input);

  if (gate.status === "HELD") {
    return {
      state: "HELD:REVALIDATION_REQUIRED",
      reason: gate.reason,
      drift: gate.drift
    };
  }

  // ? ONLY REACHED IF ELIGIBLE + INTACT
  return {
    state: "ACTIVATED_TRANSACTION_STATE",
    artifactId: input.artifactId,
    timestamp: Date.now()
  };
}
