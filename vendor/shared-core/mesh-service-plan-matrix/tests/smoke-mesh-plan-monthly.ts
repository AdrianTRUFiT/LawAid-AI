import { runMeshServicePlanMatrix } from "../src/index.js";

const result = runMeshServicePlanMatrix({
  subjectId: "plan_001",
  planCode: "MONTHLY",
});

if (!result.ok || !result.artifact || result.artifact.pricingMode !== "subscription") {
  throw new Error("Expected monthly plan.");
}

console.log("SMOKE_MESH_PLAN_MONTHLY=PASS");