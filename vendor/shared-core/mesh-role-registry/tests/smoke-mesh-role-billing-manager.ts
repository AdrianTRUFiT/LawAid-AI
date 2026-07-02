import { runMeshRoleRegistry } from "../src/index.js";

const result = runMeshRoleRegistry({
  subjectId: "role_003",
  roleCode: "BILLING_MANAGER",
});

if (!result.ok || !result.artifact || result.artifact.canAffectBilling !== true) {
  throw new Error("Expected billing manager role.");
}

console.log("SMOKE_MESH_ROLE_BILLING_MANAGER=PASS");