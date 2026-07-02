export type CanonicalSlotState =
  | "OPEN"
  | "RESERVED"
  | "OCCUPIED"
  | "BLOCKED"
  | "AUTHORIZATION_REQUIRED"
  | "RELEASED"
  | "RETIRED";

export interface SlotStateTransition {
  fromState: CanonicalSlotState;
  toState: CanonicalSlotState;
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface SlotStateRecord {
  slotId: string;
  slotType: string;
  nodeId: string;
  laneId: string;
  currentState: CanonicalSlotState;
  createdAt: string;
  updatedAt: string;
  stateVersion: number;
  transitionHistory: SlotStateTransition[];
  metadata?: Record<string, string>;
}

export interface SlotRegistrySnapshot {
  totalSlots: number;
  openCount: number;
  reservedCount: number;
  occupiedCount: number;
  blockedCount: number;
  authorizationRequiredCount: number;
  releasedCount: number;
  retiredCount: number;
}

export interface SlotRegistryRefusal {
  refusalCode:
    | "SLOT_NOT_FOUND"
    | "INVALID_TRANSITION"
    | "DUPLICATE_SLOT"
    | "INVALID_LOOKUP";
  refusalReason: string;
  slotId?: string;
}

export interface SlotRegistryResult<T> {
  ok: boolean;
  value: T | null;
  refusal: SlotRegistryRefusal | null;
}