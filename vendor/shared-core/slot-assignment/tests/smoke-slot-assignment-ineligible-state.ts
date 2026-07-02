import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { runSlotAssignment } from "../src/index.js";

const slotRegistry = new SlotStateRegistry();
const occupancyRegistry = new OccupancyRegistry();

slotRegistry.createSlot({
  slotId: "slot_assign_005",
  slotType: "transport_slot",
  nodeId: "node_e",
  laneId: "lane_e",
  initialState: "BLOCKED",
  createdBy: "test",
});

const result = runSlotAssignment({
  request: {
    assignmentId: "assign_005",
    slotId: "slot_assign_005",
    subjectId: "subject_005",
    subjectType: "package",
    claimId: "claim_005",
    requestedBy: "user_e",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "operator",
    window: { startAt: new Date().toISOString() },
  },
  slotRegistry,
  occupancyRegistry,
});

if (result.ok || result.refusal?.refusalCode !== "SLOT_STATE_INELIGIBLE") {
  throw new Error("Expected ineligible-state refusal.");
}

console.log("SMOKE_SLOT_ASSIGNMENT_INELIGIBLE_STATE=PASS");