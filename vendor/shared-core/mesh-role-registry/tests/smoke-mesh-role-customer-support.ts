import { runMeshRoleRegistry } from "../src/index.js";

const result = runMeshRoleRegistry({
  subjectId: "role_004",
  roleCode: "CUSTOMER_SUPPORT",
});

if (!result.ok || !result.artifact || result.artifact.responsibilityClass !== "support") {
  throw new Error("Expected customer support role.");
}

console.log("SMOKE_MESH_ROLE_CUSTOMER_SUPPORT=PASS");