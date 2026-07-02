import { runMeshCapacityPlanning } from "../src/index.js";

const result = runMeshCapacityPlanning({
  subjectId: "cap_005",
  regionCount: 0,
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_REGION_COUNT") {
  throw new Error("Expected invalid-region refusal.");
}

console.log("SMOKE_MESH_CAPACITY_INVALID_REGION=PASS");