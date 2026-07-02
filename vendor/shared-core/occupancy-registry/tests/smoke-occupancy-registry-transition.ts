import { OccupancyRegistry } from "../src/index.js";

const registry = new OccupancyRegistry();

registry.createOccupancy({
  occupancyId: "occ_004",
  slotId: "slot_004",
  subjectId: "subject_004",
  subjectType: "package",
  claimId: "claim_004",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

const transitioned = registry.transitionOccupancy({
  occupancyId: "occ_004",
  toState: "HELD",
});

if (!transitioned.ok || !transitioned.value || transitioned.value.occupancyState !== "HELD") {
  throw new Error("Expected valid occupancy transition.");
}

console.log("SMOKE_OCCUPANCY_REGISTRY_TRANSITION=PASS");