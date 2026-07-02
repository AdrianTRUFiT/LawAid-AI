import { SlotStateRegistry } from "../src/index.js";

const registry = new SlotStateRegistry();

registry.createSlot({
  slotId: "slot_005",
  slotType: "transport_slot",
  nodeId: "node_e",
  laneId: "lane_e",
  initialState: "OPEN",
  createdBy: "test",
});

registry.createSlot({
  slotId: "slot_006",
  slotType: "transport_slot",
  nodeId: "node_f",
  laneId: "lane_f",
  initialState: "BLOCKED",
  createdBy: "test",
});

const snapshot = registry.snapshot();

if (snapshot.totalSlots !== 2 || snapshot.openCount !== 1 || snapshot.blockedCount !== 1) {
  throw new Error("Expected snapshot counts.");
}

console.log("SMOKE_SLOT_STATE_REGISTRY_SNAPSHOT=PASS");