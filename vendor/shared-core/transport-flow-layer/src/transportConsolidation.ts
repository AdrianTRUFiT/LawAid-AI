import type { ConsolidationGroup, FlowTimingWindow, FlowUnit } from "./transportTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createConsolidationGroup(input: {
  memberIds: string[];
  capacityUsed: number;
  capacityMax: number;
  direction: ConsolidationGroup["direction"];
  departureWindow?: FlowTimingWindow;
  deconsolidationNodeId?: string;
  groupType?: ConsolidationGroup["groupType"];
  returnPathPlan?: string;
}): ConsolidationGroup {
  return {
    groupId: makeId("consolidation"),
    groupType: input.groupType ?? "destination_batch",
    memberIds: input.memberIds,
    capacityUsed: input.capacityUsed,
    capacityMax: input.capacityMax,
    direction: input.direction,
    departureWindow: input.departureWindow,
    returnPathPlan: input.returnPathPlan,
    deconsolidationNodeId: input.deconsolidationNodeId,
  };
}

export function canConsolidate(input: {
  flowUnits: FlowUnit[];
  capacityMax: number;
}): { ok: boolean; reason: string; capacityUsed: number } {
  const capacityUsed = input.flowUnits.reduce((sum, x) => sum + x.utilizationValue, 0);

  if (capacityUsed > input.capacityMax) {
    return {
      ok: false,
      reason: "Capacity exceeded.",
      capacityUsed,
    };
  }

  const sameDestination = new Set(input.flowUnits.map((x) => x.destinationNodeId)).size === 1;

  if (!sameDestination) {
    return {
      ok: false,
      reason: "Flow units have incompatible destinations.",
      capacityUsed,
    };
  }

  return {
    ok: true,
    reason: "Consolidation allowed.",
    capacityUsed,
  };
}

export function deconsolidateGroup(group: ConsolidationGroup): string[] {
  return [...group.memberIds];
}