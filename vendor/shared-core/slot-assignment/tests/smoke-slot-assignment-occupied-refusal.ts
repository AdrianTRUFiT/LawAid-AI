import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { runSlotAssignment } from "../src/index.js";

const slotRegistry = new SlotStateRegistry();
const occupancyRegistry = new OccupancyRegistry();

slotRegistry.createSlot({
  slotId: "slot_assign_002",
  slotType: "transport_slot",
  nodeId: "node_b",
  laneId: "lane_b",
  initialState: "OPEN",
  createdBy: "test",
});

occupancyRegistry.createOccupancy({
  occupancyId: "occ_existing",
  slotId: "slot_assign_002",
  subjectId: "subject_existing",
  subjectType: "delivery",
  claimId: "claim_existing",
  window: { startAt: new Date().toISOString() },
  createdBy: "test",
});

const result = runSlotAssignment({
  request: {
    assignmentId: "assign_002",
    slotId: "slot_assign_002",
    subjectId: "subject_002",
    subjectType: "delivery",
    claimId: "claim_002",
    requestedBy: "user_b",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "operator",
    window: { startAt: new Date().toISOString() },
  },
  slotRegistry,
  occupancyRegistry,
});

if (result.ok || result.refusal?.refusalCode !== "SLOT_ALREADY_OCCUPIED") {
  throw new Error("Expected occupied-slot refusal.");
}

console.log("SMOKE_SLOT_ASSIGNMENT_OCCUPIED_REFUSAL=PASS");