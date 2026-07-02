import type { SlotInventoryRecord } from "./slotCapacityTypes.js";

export function isUsableNow(slot: SlotInventoryRecord): boolean {
  return slot.state === "open" || slot.state === "reserved" || slot.state === "authorization_required";
}

export function nearestOpenDistance(slots: SlotInventoryRecord[]): number {
  const usable = slots.filter((x) => x.state === "open" || x.state === "reserved" || x.state === "authorization_required");
  return Math.min(...usable.map((x) => x.distanceToDestinationKm));
}