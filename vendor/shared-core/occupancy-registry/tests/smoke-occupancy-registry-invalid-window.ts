import { OccupancyRegistry } from "../src/index.js";

const registry = new OccupancyRegistry();

const invalid = registry.createOccupancy({
  occupancyId: "occ_005",
  slotId: "slot_005",
  subjectId: "subject_005",
  subjectType: "service",
  claimId: "claim_005",
  window: {
    startAt: "2026-04-16T10:00:00.000Z",
    endAt: "2026-04-15T10:00:00.000Z",
  },
  createdBy: "test",
});

if (invalid.ok || invalid.refusal?.refusalCode !== "INVALID_WINDOW") {
  throw new Error("Expected invalid window refusal.");
}

console.log("SMOKE_OCCUPANCY_REGISTRY_INVALID_WINDOW=PASS");