import type { CanonicalSlotState } from "./slotStateRegistryTypes.js";

const ALLOWED: Record<CanonicalSlotState, CanonicalSlotState[]> = {
  OPEN: ["RESERVED", "OCCUPIED", "BLOCKED", "AUTHORIZATION_REQUIRED", "RETIRED"],
  RESERVED: ["OPEN", "OCCUPIED", "BLOCKED", "RELEASED"],
  OCCUPIED: ["OPEN", "BLOCKED", "RELEASED"],
  BLOCKED: ["OPEN", "RETIRED"],
  AUTHORIZATION_REQUIRED: ["OPEN", "RESERVED", "OCCUPIED", "BLOCKED"],
  RELEASED: ["OPEN", "RETIRED"],
  RETIRED: [],
};

export function isValidSlotTransition(
  fromState: CanonicalSlotState,
  toState: CanonicalSlotState,
): boolean {
  return ALLOWED[fromState].includes(toState);
}