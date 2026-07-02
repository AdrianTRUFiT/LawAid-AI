import { SlotStateRegistry } from "../src/index.js";

const registry = new SlotStateRegistry();

const created = registry.createSlot({
  slotId: "slot_001",
  slotType: "transport_slot",
  nodeId: "node_a",
  laneId: "lane_a",
  initialState: "OPEN",
  createdBy: "test",
});

if (!created.ok || !created.value || created.value.currentState !== "OPEN") {
  throw new Error("Expected slot creation.");
}

console.log("SMOKE_SLOT_STATE_REGISTRY_CREATE=PASS");