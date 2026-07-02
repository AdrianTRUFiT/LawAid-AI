import type {
  OrchestratedSlotOption,
  SlotCapacitySnapshot,
  SlotInventoryRecord,
} from "./slotCapacityTypes.js";

export function buildWhyArrays(input: {
  slot: SlotInventoryRecord;
  capacity: SlotCapacitySnapshot;
  nearestDistance: number;
}): Pick<OrchestratedSlotOption, "why" | "who" | "what" | "where" | "when" | "how"> {
  const why: string[] = [];
  const who: string[] = [];
  const what: string[] = [];
  const where: string[] = [];
  const when: string[] = [];
  const how: string[] = [];

  who.push("originator requests movement");
  who.push(input.slot.authorizationRequired ? "authorized operator may need to approve slot use" : "slot may be used without extra approval");

  what.push(`slot state is ${input.slot.state}`);
  what.push(`lane ${input.slot.laneId} carries the movement path`);

  where.push(`current node is ${input.slot.nodeId}`);
  where.push(`distance to destination is ${input.slot.distanceToDestinationKm} km`);

  when.push(`estimated arrival window is ${input.slot.estimatedHoursToDestination} hours`);
  when.push(input.slot.state === "reserved" ? "reservation continuity may preserve access timing" : "slot timing remains current-state dependent");

  how.push(`checkpoint burden score is ${input.slot.checkpointBurdenScore}`);
  how.push(`downstream friction score is ${input.slot.downstreamFrictionScore}`);
  how.push(`capacity resistance is ${input.capacity.resistanceClass}`);

  if (input.slot.distanceToDestinationKm === input.nearestDistance) {
    why.push("nearest viable slot to destination");
  }

  if (input.slot.authorizationRequired) {
    why.push("requires authorization before movement may count");
  }

  if (input.slot.state === "blocked") {
    why.push("blocked slot creates refusal-grade friction");
  } else if (input.slot.state === "occupied") {
    why.push("occupied slot is presently unavailable");
  } else {
    why.push("slot remains a candidate for live orchestration");
  }

  if (input.capacity.resistanceClass === "high" || input.capacity.resistanceClass === "critical") {
    why.push("capacity resistance is elevated and may create downstream stress");
  }

  return { why, who, what, where, when, how };
}