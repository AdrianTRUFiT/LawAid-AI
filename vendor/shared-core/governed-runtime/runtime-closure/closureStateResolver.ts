import { ConstrainedReasons, HardRefusalReasons, HoldReasons } from "./closureReasonCodes";
import type { ClosureReason, RuntimeClosureState } from "./closureStateContracts";

export function resolveClosureState(reasons: ClosureReason[]): RuntimeClosureState {
  const unique = Array.from(new Set(reasons));

  if (unique.some((reason) => HardRefusalReasons.has(reason))) {
    return "REFUSED";
  }

  if (unique.some((reason) => HoldReasons.has(reason))) {
    return "HELD";
  }

  if (unique.some((reason) => ConstrainedReasons.has(reason))) {
    return "CONSTRAINED";
  }

  return "CLEARED";
}
