import { runMeshCapacityPlanning } from "../src/index.js";

const result = runMeshCapacityPlanning({
  subjectId: "cap_004",
  regionCount: 2,
});

if (!result.ok || !result.artifact || result.artifact.totalDevices !== 200) {
  throw new Error("Expected total devices = 200.");
}

console.log("SMOKE_MESH_CAPACITY_TOTAL_DEVICES=PASS");