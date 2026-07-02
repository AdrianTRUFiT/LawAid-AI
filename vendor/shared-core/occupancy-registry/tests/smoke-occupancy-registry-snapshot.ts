import { OccupancyRegistry } from "../src/index.js";

const registry = new OccupancyRegistry();

registry.createOccupancy({
  occupancyId: "occ_006",
  slotId: "slot_006",
  subjectId: "subject_006",
  subjectType: "reservation",
  claimId: "claim_006",
  occupancyState: "ACTIVE",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

registry.createOccupancy({
  occupancyId: "occ_007",
  slotId: "slot_007",
  subjectId: "subject_007",
  subjectType: "workflow_state",
  claimId: "claim_007",
  occupancyState: "HELD",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

const snapshot = registry.snapshot();

if (snapshot.totalOccupancies !== 2 || snapshot.activeCount !== 1 || snapshot.heldCount !== 1) {
  throw new Error("Expected occupancy snapshot counts.");
}

console.log("SMOKE_OCCUPANCY_REGISTRY_SNAPSHOT=PASS");