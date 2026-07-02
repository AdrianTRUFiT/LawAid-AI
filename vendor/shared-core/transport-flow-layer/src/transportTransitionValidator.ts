import type { FlowUnit, MovementState } from "./transportTypes.js";
import { assertLegalTransition } from "./transportStates.js";

export function validateFlowStateTransition(input: {
  flowUnit: FlowUnit;
  nextState: MovementState;
}): { ok: boolean; reason: string } {
  return assertLegalTransition({
    currentState: input.flowUnit.currentState,
    nextState: input.nextState,
  });
}