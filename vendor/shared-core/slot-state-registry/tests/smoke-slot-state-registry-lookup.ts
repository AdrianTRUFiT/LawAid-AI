import { SlotStateRegistry } from "../src/index.js";

const registry = new SlotStateRegistry();

registry.createSlot({
  slotId: "slot_004",
  slotType: "transport_slot",
  nodeId: "node_d",
  laneId: "lane_d",
  initialState: "AUTHORIZATION_REQUIRED",
  createdBy: "test",
});

const found = registry.getSlot("slot_004");

if (!found.ok || !found.value || found.value.currentState !== "AUTHORIZATION_REQUIRED") {
  throw new Error("Expected slot lookup success.");
}

console.log("SMOKE_SLOT_STATE_REGISTRY_LOOKUP=PASS");