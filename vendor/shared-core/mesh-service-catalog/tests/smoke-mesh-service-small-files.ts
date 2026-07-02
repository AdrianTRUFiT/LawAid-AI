import { runMeshServiceCatalog } from "../src/index.js";

const result = runMeshServiceCatalog({
  subjectId: "svc_004",
  serviceCode: "SMALL_FILES",
});

if (!result.ok || !result.artifact || result.artifact.transactionalEligible !== true) {
  throw new Error("Expected small-files transactional eligibility.");
}

console.log("SMOKE_MESH_SERVICE_SMALL_FILES=PASS");