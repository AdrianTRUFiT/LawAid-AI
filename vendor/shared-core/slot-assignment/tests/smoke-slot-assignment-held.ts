import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { runSlotAssignment } from "../src/index.js";

const slotRegistry = new SlotStateRegistry();
const occupancyRegistry = new OccupancyRegistry();

slotRegistry.createSlot({
  slotId: "slot_assign_004",
  slotType: "transport_slot",
  nodeId: "node_d",
  laneId: "lane_d",
  initialState: "OPEN",
  createdBy: "test",
});

const result = runSlotAssignment({
  request: {
    assignmentId: "assign_004",
    slotId: "slot_assign_004",
    subjectId: "subject_004",
    subjectType: "workflow_state",
    claimId: "claim_004",
    requestedBy: "user_d",
    requiredAuthorizationClass: "system_admin",
    providedAuthorizationClass: "operator",
    holdAllowed: true,
    continuityProtected: true,
    window: { startAt: new Date().toISOString() },
  },
  slotRegistry,
  occupancyRegistry,
});

if (result.ok || result.refusal?.refusalCode !== "ASSIGNMENT_HELD" || !result.artifact || result.artifact.decision !== "HELD") {
  throw new Error("Expected held assignment.");
}

console.log("SMOKE_SLOT_ASSIGNMENT_HELD=PASS");