import type { OccupancyState } from "./occupancyRegistryTypes.js";

const ALLOWED: Record<OccupancyState, OccupancyState[]> = {
  ACTIVE: ["HELD", "RELEASED", "EXPIRED", "CANCELLED"],
  HELD: ["ACTIVE", "RELEASED", "EXPIRED", "CANCELLED"],
  RELEASED: [],
  EXPIRED: [],
  CANCELLED: [],
};

export function isValidOccupancyTransition(
  fromState: OccupancyState,
  toState: OccupancyState,
): boolean {
  return ALLOWED[fromState].includes(toState);
}