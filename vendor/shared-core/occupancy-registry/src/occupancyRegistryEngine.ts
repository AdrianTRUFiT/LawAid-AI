import type {
  OccupancyRecord,
  OccupancyResult,
  OccupancySnapshot,
  OccupancyState,
} from "./occupancyRegistryTypes.js";
import { isValidOccupancyTransition } from "./occupancyStateTransitions.js";
import { isValidWindow, nowIso } from "./occupancyRegistryUtils.js";

export class OccupancyRegistry {
  private records = new Map<string, OccupancyRecord>();

  createOccupancy(input: {
    occupancyId: string;
    slotId: string;
    subjectId: string;
    subjectType: OccupancyRecord["subjectType"];
    claimId: string;
    occupancyState?: OccupancyState;
    continuityProtected?: boolean;
    window: {
      startAt: string;
      endAt?: string;
    };
    createdBy: string;
    metadata?: Record<string, string>;
  }): OccupancyResult<OccupancyRecord> {
    if (!input.slotId || input.slotId.trim() === "") {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "INVALID_SLOT_REFERENCE",
          refusalReason: "Occupancy creation refused because slotId is invalid.",
        },
      };
    }

    if (!isValidWindow(input.window.startAt, input.window.endAt)) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "INVALID_WINDOW",
          refusalReason: "Occupancy creation refused because window is invalid.",
          slotId: input.slotId,
        },
      };
    }

    if (this.records.has(input.occupancyId)) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "DUPLICATE_OCCUPANCY",
          refusalReason: "Occupancy creation refused because occupancyId already exists.",
          slotId: input.slotId,
          occupancyId: input.occupancyId,
        },
      };
    }

    const existingActive = Array.from(this.records.values()).find(
      (x) =>
        x.slotId === input.slotId &&
        (x.occupancyState === "ACTIVE" || x.occupancyState === "HELD"),
    );

    if (existingActive) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "SLOT_ALREADY_OCCUPIED",
          refusalReason: "Occupancy creation refused because slot already has active or held occupancy.",
          slotId: input.slotId,
        },
      };
    }

    const now = nowIso();

    const record: OccupancyRecord = {
      occupancyId: input.occupancyId,
      slotId: input.slotId,
      subjectId: input.subjectId,
      subjectType: input.subjectType,
      claimId: input.claimId,
      occupancyState: input.occupancyState ?? "ACTIVE",
      continuityProtected: input.continuityProtected ?? false,
      window: input.window,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
      metadata: input.metadata,
    };

    this.records.set(record.occupancyId, record);

    return {
      ok: true,
      value: record,
      refusal: null,
    };
  }

  getOccupancy(occupancyId: string): OccupancyResult<OccupancyRecord> {
    const found = this.records.get(occupancyId);

    if (!found) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "OCCUPANCY_NOT_FOUND",
          refusalReason: "Occupancy lookup refused because occupancyId does not exist.",
          occupancyId,
        },
      };
    }

    return {
      ok: true,
      value: found,
      refusal: null,
    };
  }

  transitionOccupancy(input: {
    occupancyId: string;
    toState: OccupancyState;
  }): OccupancyResult<OccupancyRecord> {
    const current = this.records.get(input.occupancyId);

    if (!current) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "OCCUPANCY_NOT_FOUND",
          refusalReason: "Occupancy transition refused because occupancyId does not exist.",
          occupancyId: input.occupancyId,
        },
      };
    }

    if (!isValidOccupancyTransition(current.occupancyState, input.toState)) {
      return {
        ok: false,
        value: null,
        refusal: {
          refusalCode: "INVALID_STATE_TRANSITION",
          refusalReason: `Occupancy transition refused from ${current.occupancyState} to ${input.toState}.`,
          occupancyId: input.occupancyId,
        },
      };
    }

    const updated: OccupancyRecord = {
      ...current,
      occupancyState: input.toState,
      updatedAt: nowIso(),
    };

    this.records.set(updated.occupancyId, updated);

    return {
      ok: true,
      value: updated,
      refusal: null,
    };
  }

  getActiveBySlot(slotId: string): OccupancyRecord | null {
    const found = Array.from(this.records.values()).find(
      (x) =>
        x.slotId === slotId &&
        (x.occupancyState === "ACTIVE" || x.occupancyState === "HELD"),
    );

    return found ?? null;
  }

  snapshot(): OccupancySnapshot {
    const values = Array.from(this.records.values());

    return {
      totalOccupancies: values.length,
      activeCount: values.filter((x) => x.occupancyState === "ACTIVE").length,
      heldCount: values.filter((x) => x.occupancyState === "HELD").length,
      releasedCount: values.filter((x) => x.occupancyState === "RELEASED").length,
      expiredCount: values.filter((x) => x.occupancyState === "EXPIRED").length,
      cancelledCount: values.filter((x) => x.occupancyState === "CANCELLED").length,
    };
  }
}