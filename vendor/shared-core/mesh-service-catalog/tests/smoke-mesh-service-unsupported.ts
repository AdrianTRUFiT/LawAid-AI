import { runMeshServiceCatalog } from "../src/index.js";

const result = runMeshServiceCatalog({
  subjectId: "svc_005",
  serviceCode: "FULL_CLOUD_GAMING",
});

if (result.ok || result.refusal?.refusalCode !== "UNSUPPORTED_SERVICE") {
  throw new Error("Expected unsupported-service refusal.");
}

console.log("SMOKE_MESH_SERVICE_UNSUPPORTED=PASS");