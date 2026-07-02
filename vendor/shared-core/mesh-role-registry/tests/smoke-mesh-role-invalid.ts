import { runMeshRoleRegistry } from "../src/index.js";

const result = runMeshRoleRegistry({
  subjectId: "role_005",
  roleCode: "FIELD_COMMANDER",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_ROLE") {
  throw new Error("Expected invalid-role refusal.");
}

console.log("SMOKE_MESH_ROLE_INVALID=PASS");