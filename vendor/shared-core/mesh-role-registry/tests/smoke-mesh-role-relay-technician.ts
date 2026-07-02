import { runMeshRoleRegistry } from "../src/index.js";

const result = runMeshRoleRegistry({
  subjectId: "role_002",
  roleCode: "RELAY_TECHNICIAN",
});

if (!result.ok || !result.artifact || result.artifact.canAffectRelays !== true) {
  throw new Error("Expected relay technician role.");
}

console.log("SMOKE_MESH_ROLE_RELAY_TECHNICIAN=PASS");