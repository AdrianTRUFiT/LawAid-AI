import { OccupancyRegistry } from "../src/index.js";

const registry = new OccupancyRegistry();

const created = registry.createOccupancy({
  occupancyId: "occ_001",
  slotId: "slot_001",
  subjectId: "subject_001",
  subjectType: "reservation",
  claimId: "claim_001",
  window: {
    startAt: new Date().toISOString(),
  },
  createdBy: "test",
});

if (!created.ok || !created.value || created.value.occupancyState !== "ACTIVE") {
  throw new Error("Expected occupancy creation.");
}

console.log("SMOKE_OCCUPANCY_REGISTRY_CREATE=PASS");