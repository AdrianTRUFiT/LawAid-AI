import { runMeshCapacityPlanning } from "../src/index.js";

const result = runMeshCapacityPlanning({
  subjectId: "cap_003",
  regionCount: 2,
});

if (!result.ok || !result.artifact || result.artifact.totalRelays !== 20) {
  throw new Error("Expected total relays = 20.");
}

console.log("SMOKE_MESH_CAPACITY_TOTAL_RELAYS=PASS");