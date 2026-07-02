import { runMeshServiceCatalog } from "../src/index.js";

const result = runMeshServiceCatalog({
  subjectId: "svc_002",
  serviceCode: "VIDEO_STREAMING",
});

if (!result.ok || !result.artifact || result.artifact.category !== "entertainment") {
  throw new Error("Expected entertainment service.");
}

console.log("SMOKE_MESH_SERVICE_ENTERTAINMENT=PASS");