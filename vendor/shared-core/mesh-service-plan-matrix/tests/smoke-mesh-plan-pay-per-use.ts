import { runMeshServicePlanMatrix } from "../src/index.js";

const result = runMeshServicePlanMatrix({
  subjectId: "plan_002",
  planCode: "PAY_PER_USE",
});

if (!result.ok || !result.artifact || result.artifact.pricingMode !== "metered") {
  throw new Error("Expected pay-per-use plan.");
}

console.log("SMOKE_MESH_PLAN_PAY_PER_USE=PASS");