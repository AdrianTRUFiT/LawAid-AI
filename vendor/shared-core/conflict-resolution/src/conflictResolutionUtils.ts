import type { AuthorizationClass } from "./../../authorization-gate/src/index.js";
import type { ConflictCandidateRequest, ConflictExistingOccupancyView } from "./conflictResolutionTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function deriveCandidatePriorityScore(candidate: ConflictCandidateRequest): number {
  const base = candidate.priorityScore ?? 50;
  const continuityBonus = candidate.continuityProtected ? 20 : 0;
  const holdBonus = candidate.holdAllowed ? 5 : 0;
  return base + continuityBonus + holdBonus;
}

export function deriveExistingPriorityScore(existing: ConflictExistingOccupancyView): number {
  const stateWeight = existing.occupancyState === "ACTIVE" ? 70 : existing.occupancyState === "HELD" ? 55 : 10;
  const continuityBonus = existing.continuityProtected ? 25 : 0;
  return stateWeight + continuityBonus;
}

export function authorizationRank(value: AuthorizationClass | undefined): number {
  switch (value) {
    case "none": return 0;
    case "operator": return 1;
    case "supervisor": return 2;
    case "system_admin": return 3;
    case "compliance": return 4;
    default: return -1;
  }
}