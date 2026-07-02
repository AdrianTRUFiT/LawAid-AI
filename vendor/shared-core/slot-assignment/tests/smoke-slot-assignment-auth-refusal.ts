import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { runSlotAssignment } from "../src/index.js";

const slotRegistry = new SlotStateRegistry();
const occupancyRegistry = new OccupancyRegistry();

slotRegistry.createSlot({
  slotId: "slot_assign_003",
  slotType: "transport_slot",
  nodeId: "node_c",
  laneId: "lane_c",
  initialState: "OPEN",
  createdBy: "test",
});

const result = runSlotAssignment({
  request: {
    assignmentId: "assign_003",
    slotId: "slot_assign_003",
    subjectId: "subject_003",
    subjectType: "reservation",
    claimId: "claim_003",
    requestedBy: "user_c",
    requiredAuthorizationClass: "supervisor",
    providedAuthorizationClass: "operator",
    window: { startAt: new Date().toISOString() },
  },
  slotRegistry,
  occupancyRegistry,
});

if (result.ok || result.refusal?.refusalCode !== "INSUFFICIENT_AUTHORIZATION") {
  throw new Error("Expected insufficient authorization refusal.");
}

console.log("SMOKE_SLOT_ASSIGNMENT_AUTH_REFUSAL=PASS");