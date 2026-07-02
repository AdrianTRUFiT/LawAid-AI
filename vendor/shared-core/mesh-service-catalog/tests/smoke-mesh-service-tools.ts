import { runMeshServiceCatalog } from "../src/index.js";

const result = runMeshServiceCatalog({
  subjectId: "svc_003",
  serviceCode: "WEATHER",
});

if (!result.ok || !result.artifact || result.artifact.category !== "tools") {
  throw new Error("Expected tools service.");
}

console.log("SMOKE_MESH_SERVICE_TOOLS=PASS");