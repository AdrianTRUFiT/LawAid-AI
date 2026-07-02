import type { MeshRoleCode } from "./meshRoleRegistryTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeMeshRoleRegistryId(subjectId: string, roleCode: MeshRoleCode): string {
  return `mesh_role_${subjectId}_${roleCode}`;
}

export function isMeshRoleCode(value: string): value is MeshRoleCode {
  return [
    "NETWORK_BUILDER",
    "RELAY_TECHNICIAN",
    "BILLING_MANAGER",
    "CUSTOMER_SUPPORT",
    "CONTENT_MANAGER"
  ].includes(value);
}