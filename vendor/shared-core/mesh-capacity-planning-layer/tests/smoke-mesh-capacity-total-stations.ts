import { runMeshCapacityPlanning } from "../src/index.js";

const result = runMeshCapacityPlanning({
  subjectId: "cap_002",
  regionCount: 2,
});

if (!result.ok || !result.artifact || result.artifact.totalStations !== 6) {
  throw new Error("Expected total stations = 6.");
}

console.log("SMOKE_MESH_CAPACITY_TOTAL_STATIONS=PASS");