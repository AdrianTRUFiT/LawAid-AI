import { SlotStateRegistry } from "../src/index.js";

const registry = new SlotStateRegistry();

registry.createSlot({
  slotId: "slot_003",
  slotType: "transport_slot",
  nodeId: "node_c",
  laneId: "lane_c",
  initialState: "RETIRED",
  createdBy: "test",
});

const transitioned = registry.transitionSlot({
  slotId: "slot_003",
  toState: "OPEN",
  reason: "should fail",
  changedBy: "test",
});

if (transitioned.ok || transitioned.refusal?.refusalCode !== "INVALID_TRANSITION") {
  throw new Error("Expected invalid transition refusal.");
}

console.log("SMOKE_SLOT_STATE_REGISTRY_INVALID_TRANSITION=PASS");