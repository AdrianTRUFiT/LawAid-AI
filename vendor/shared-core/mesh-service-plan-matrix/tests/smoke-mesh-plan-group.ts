import { runMeshServicePlanMatrix } from "../src/index.js";

const result = runMeshServicePlanMatrix({
  subjectId: "plan_003",
  planCode: "GROUP_PLAN",
});

if (!result.ok || !result.artifact || result.artifact.pricingMode !== "shared") {
  throw new Error("Expected group plan.");
}

console.log("SMOKE_MESH_PLAN_GROUP=PASS");