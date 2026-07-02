import type {
  CanonicalSlotState,
  SlotRegistryResult,
  SlotRegistrySnapshot,
  SlotStateRecord,
} from "./slotStateRegistryTypes.js";
import { nowIso } from "./slotStateRegistryUtils.js";
import { isValidSlotTransition } from "./slotStateTransitions.js";

export class SlotStateRegistry {
  private records = new Map<string, SlotStateRecord>();

  createSlot(input: {
    slotId: string;
    slotType: string;
    nodeId: string;
    laneId: string;
    initialState: CanonicalSlotState;
    createdBy: string;
    metadata?: Record<string, string>;
  }): SlotRegistryResult<SlotStateRecord> {
    if (this.records.has(input.slotId)) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "DUPLICATE_SLOT",
          refusalReason: "Slot creation refused because slotId already exists.",
          slotId: input.slotId,
        },
      };
    }

    const now = nowIso();

    const record: SlotStateRecord = {
      slotId: input.slotId,
      slotType: input.slotType,
      nodeId: input.nodeId,
      laneId: input.laneId,
      currentState: input.initialState,
      createdAt: now,
      updatedAt: now,
      stateVersion: 1,
      transitionHistory: [],
      metadata: input.metadata,
    };

    this.records.set(input.slotId, record);

    return {
      ok: true,
      value: record,
      refusal: null,
    };
  }

  getSlot(slotId: string): SlotRegistryResult<SlotStateRecord> {
    const found = this.records.get(slotId);

    if (!found) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "SLOT_NOT_FOUND",
          refusalReason: "Slot lookup refused because slotId does not exist.",
          slotId,
        },
      };
    }

    return {
      ok: true,
      value: found,
      refusal: null,
    };
  }

  transitionSlot(input: {
    slotId: string;
    toState: CanonicalSlotState;
    reason: string;
    changedBy: string;
  }): SlotRegistryResult<SlotStateRecord> {
    const current = this.records.get(input.slotId);

    if (!current) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "SLOT_NOT_FOUND",
          refusalReason: "Slot transition refused because slotId does not exist.",
          slotId: input.slotId,
        },
      };
    }

    if (!isValidSlotTransition(current.currentState, input.toState)) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "INVALID_TRANSITION",
          refusalReason: `Slot transition refused from ${current.currentState} to ${input.toState}.`,
          slotId: input.slotId,
        },
      };
    }

    const updated: SlotStateRecord = {
      ...current,
      currentState: input.toState,
      updatedAt: nowIso(),
      stateVersion: current.stateVersion + 1,
      transitionHistory: [
        ...current.transitionHistory,
        {
          fromState: current.currentState,
          toState: input.toState,
          reason: input.reason,
          changedAt: nowIso(),
          changedBy: input.changedBy,
        },
      ],
    };

    this.records.set(input.slotId, updated);

    return {
      ok: true,
      value: updated,
      refusal: null,
    };
  }

  snapshot(): SlotRegistrySnapshot {
    const records = Array.from(this.records.values());

    return {
      totalSlots: records.length,
      openCount: records.filter((x) => x.currentState === "OPEN").length,
      reservedCount: records.filter((x) => x.currentState === "RESERVED").length,
      occupiedCount: records.filter((x) => x.currentState === "OCCUPIED").length,
      blockedCount: records.filter((x) => x.currentState === "BLOCKED").length,
      authorizationRequiredCount: records.filter((x) => x.currentState === "AUTHORIZATION_REQUIRED").length,
      releasedCount: records.filter((x) => x.currentState === "RELEASED").length,
      retiredCount: records.filter((x) => x.currentState === "RETIRED").length,
    };
  }
}