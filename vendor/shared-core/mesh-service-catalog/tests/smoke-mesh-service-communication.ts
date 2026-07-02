import { runMeshServiceCatalog } from "../src/index.js";

const result = runMeshServiceCatalog({
  subjectId: "svc_001",
  serviceCode: "MESSAGING",
});

if (!result.ok || !result.artifact || result.artifact.category !== "communication") {
  throw new Error("Expected communication service.");
}

console.log("SMOKE_MESH_SERVICE_COMMUNICATION=PASS");