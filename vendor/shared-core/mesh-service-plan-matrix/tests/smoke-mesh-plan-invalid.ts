import { runMeshServicePlanMatrix } from "../src/index.js";

const result = runMeshServicePlanMatrix({
  subjectId: "plan_005",
  planCode: "LIFETIME",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_PLAN") {
  throw new Error("Expected invalid-plan refusal.");
}

console.log("SMOKE_MESH_PLAN_INVALID=PASS");