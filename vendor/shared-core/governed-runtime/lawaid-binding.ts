import { enforceEligibility } from './eligibility/enforce-eligibility';

export function lawAidWriteGate(input: any) {

  const gate = enforceEligibility(input);

  if (gate.status === "HELD") {
    return {
      state: "WRITE_BLOCKED_HELD",
      reason: gate.reason,
      drift: gate.drift
    };
  }

  return {
    state: "WRITE_ALLOWED",
    record: input
  };
}
