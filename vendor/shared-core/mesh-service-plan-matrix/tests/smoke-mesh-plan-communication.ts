import { runMeshServicePlanMatrix } from "../src/index.js";

const result = runMeshServicePlanMatrix({
  subjectId: "plan_004",
  planCode: "PAY_PER_USE",
});

if (!result.ok || !result.artifact || !result.artifact.allowedCategories.includes("communication")) {
  throw new Error("Expected communication availability.");
}

console.log("SMOKE_MESH_PLAN_COMMUNICATION=PASS");