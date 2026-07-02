import type { MovementState } from "./transportTypes.js";

const LEGAL_TRANSITIONS: Record<MovementState, MovementState[]> = {
  CREATED: ["READY_FOR_PICKUP", "HELD", "REFUSED", "FAILED"],
  READY_FOR_PICKUP: ["COLLECTED", "HELD", "REFUSED", "FAILED"],
  COLLECTED: ["ARRIVED_AT_COLLECTION_NODE", "HELD", "REROUTED", "FAILED"],
  ARRIVED_AT_COLLECTION_NODE: ["CONSOLIDATED", "HELD", "REROUTED", "FAILED"],
  CONSOLIDATED: ["IN_TRANSIT", "HELD", "REROUTED", "FAILED"],
  IN_TRANSIT: ["AT_BORDER_REVIEW", "ARRIVED_AT_REGIONAL_HUB", "HELD", "REROUTED", "FAILED"],
  AT_BORDER_REVIEW: ["CLEARED", "HELD", "REFUSED", "REROUTED", "FAILED"],
  CLEARED: ["ARRIVED_AT_REGIONAL_HUB", "STAGED", "IN_TRANSIT"],
  HELD: ["CLEARED", "REROUTED", "REFUSED", "FAILED"],
  REFUSED: ["CLOSED"],
  ARRIVED_AT_REGIONAL_HUB: ["DECONSOLIDATED", "STAGED", "REROUTED"],
  DECONSOLIDATED: ["STAGED", "OUT_FOR_DELIVERY", "RETURNING"],
  STAGED: ["OUT_FOR_DELIVERY", "REROUTED", "RETURNING"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED", "RETURNING"],
  DELIVERED: ["CLOSED"],
  FAILED: ["REROUTED", "RETURNING", "CLOSED"],
  REROUTED: ["IN_TRANSIT", "STAGED", "OUT_FOR_DELIVERY", "RETURNING"],
  RETURNING: ["ARRIVED_AT_REGIONAL_HUB", "CLOSED"],
  CLOSED: [],
};

export function canTransition(
  currentState: MovementState,
  nextState: MovementState,
): boolean {
  return LEGAL_TRANSITIONS[currentState].includes(nextState);
}

export function assertLegalTransition(input: {
  currentState: MovementState;
  nextState: MovementState;
}): { ok: boolean; reason: string } {
  if (canTransition(input.currentState, input.nextState)) {
    return {
      ok: true,
      reason: "Transition allowed.",
    };
  }

  return {
    ok: false,
    reason: `Illegal transition from ${input.currentState} to ${input.nextState}.`,
  };
}

export function getLegalTransitions(
  currentState: MovementState,
): MovementState[] {
  return [...LEGAL_TRANSITIONS[currentState]];
}