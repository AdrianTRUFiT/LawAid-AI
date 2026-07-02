import { runMeshCapacityPlanning } from "../src/index.js";

const result = runMeshCapacityPlanning({
  subjectId: "cap_001",
  regionCount: 2,
});

if (!result.ok || !result.artifact || result.artifact.regionCount !== 2) {
  throw new Error("Expected default region calculation.");
}

console.log("SMOKE_MESH_CAPACITY_DEFAULT_REGION=PASS");