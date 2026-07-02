import { OccupancyRegistry } from "../src/index.js";

const registry = new OccupancyRegistry();

registry.createOccupancy({
  occupancyId: "occ_002",
  slotId: "slot_002",
  subjectId: "subject_002",
  subjectType: "delivery",
  claimId: "claim_002",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

const duplicate = registry.createOccupancy({
  occupancyId: "occ_003",
  slotId: "slot_002",
  subjectId: "subject_003",
  subjectType: "delivery",
  claimId: "claim_003",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

if (duplicate.ok || duplicate.refusal?.refusalCode !== "SLOT_ALREADY_OCCUPIED") {
  throw new Error("Expected duplicate slot occupancy refusal.");
}

console.log("SMOKE_OCCUPANCY_REGISTRY_DUPLICATE_SLOT=PASS");