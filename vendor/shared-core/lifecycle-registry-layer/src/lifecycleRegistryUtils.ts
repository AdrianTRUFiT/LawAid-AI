import type { LifecycleState } from "./lifecycleRegistryTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeLifecycleEventId(subjectId: string, currentState: LifecycleState, requestedState: LifecycleState): string {
  return `lifecycle_${subjectId}_${currentState}_${requestedState}`;
}

export const ALLOWED_TRANSITIONS: Record<LifecycleState, LifecycleState[]> = {
  PROSPECT: ["IDENTIFIED", "OFFERED"],
  IDENTIFIED: ["OFFERED", "PENDING_ACCEPTANCE"],
  OFFERED: ["PENDING_ACCEPTANCE", "IDENTIFIED"],
  PENDING_ACCEPTANCE: ["ACTIVE_TRIAL", "ACTIVE_PAID", "OFFERED"],
  ACTIVE_TRIAL: ["ACTIVE_PAID", "GRACE", "EXPIRED", "PAUSED"],
  ACTIVE_PAID: ["GRACE", "PAUSED", "DOWNGRADED", "CANCELED_PERIOD_END", "ARCHIVED"],
  GRACE: ["ACTIVE_PAID", "PAST_DUE", "ARCHIVED", "EXPIRED"],
  PAST_DUE: ["ACTIVE_PAID", "DOWNGRADED", "ARCHIVED", "EXPIRED"],
  DOWNGRADED: ["ACTIVE_PAID", "PAUSED", "ARCHIVED"],
  PAUSED: ["REACTIVATED", "ARCHIVED", "EXPIRED"],
  CANCELED_PERIOD_END: ["ARCHIVED", "EXPIRED", "REACTIVATED"],
  ARCHIVED: ["REACTIVATED"],
  EXPIRED: ["REACTIVATED", "ARCHIVED"],
  REACTIVATED: ["ACTIVE_PAID", "ACTIVE_TRIAL"],
  REQUESTOR_FUNDED: ["ACTIVE_PAID", "PENDING_ACCEPTANCE"]
};

export function isAllowedTransition(currentState: LifecycleState, requestedState: LifecycleState): boolean {
  return ALLOWED_TRANSITIONS[currentState].includes(requestedState);
}