import { runMeshRoleRegistry } from "../src/index.js";

const result = runMeshRoleRegistry({
  subjectId: "role_001",
  roleCode: "NETWORK_BUILDER",
});

if (!result.ok || !result.artifact || result.artifact.canAffectStations !== true) {
  throw new Error("Expected network builder role.");
}

console.log("SMOKE_MESH_ROLE_NETWORK_BUILDER=PASS");