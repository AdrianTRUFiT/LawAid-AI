import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { runSlotAssignment } from "../src/index.js";

const slotRegistry = new SlotStateRegistry();
const occupancyRegistry = new OccupancyRegistry();

slotRegistry.createSlot({
  slotId: "slot_assign_001",
  slotType: "transport_slot",
  nodeId: "node_a",
  laneId: "lane_a",
  initialState: "OPEN",
  createdBy: "test",
});

const result = runSlotAssignment({
  request: {
    assignmentId: "assign_001",
    slotId: "slot_assign_001",
    subjectId: "subject_001",
    subjectType: "reservation",
    claimId: "claim_001",
    requestedBy: "user_a",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "supervisor",
    continuityProtected: true,
    window: { startAt: new Date().toISOString() },
  },
  slotRegistry,
  occupancyRegistry,
});

if (!result.ok || !result.artifact || result.artifact.decision !== "ASSIGNED") {
  throw new Error("Expected slot assignment success.");
}

console.log("SMOKE_SLOT_ASSIGNMENT_SUCCESS=PASS");