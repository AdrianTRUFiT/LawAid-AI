import { SlotStateRegistry } from "../src/index.js";

const registry = new SlotStateRegistry();

registry.createSlot({
  slotId: "slot_002",
  slotType: "transport_slot",
  nodeId: "node_b",
  laneId: "lane_b",
  initialState: "OPEN",
  createdBy: "test",
});

const transitioned = registry.transitionSlot({
  slotId: "slot_002",
  toState: "RESERVED",
  reason: "reservation hold",
  changedBy: "test",
});

if (!transitioned.ok || !transitioned.value || transitioned.value.currentState !== "RESERVED") {
  throw new Error("Expected valid slot transition.");
}

console.log("SMOKE_SLOT_STATE_REGISTRY_TRANSITION=PASS");