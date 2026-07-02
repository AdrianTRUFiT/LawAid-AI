export type MeshRoleCode =
  | "NETWORK_BUILDER"
  | "RELAY_TECHNICIAN"
  | "BILLING_MANAGER"
  | "CUSTOMER_SUPPORT"
  | "CONTENT_MANAGER";

export interface MeshRoleRegistryInput {
  subjectId: string;
  roleCode: string;
}

export interface MeshRoleRegistryArtifact {
  roleRegistryId: string;
  subjectId: string;
  roleCode: MeshRoleCode;
  responsibilityClass: "infrastructure" | "operations" | "commercial" | "support" | "content";
  canAffectStations: boolean;
  canAffectRelays: boolean;
  canAffectBilling: boolean;
  canAffectContent: boolean;
  reason: string;
  createdAt: string;
}

export interface MeshRoleRegistryRefusal {
  refusalCode: "INVALID_ROLE";
  refusalReason: string;
}

export interface MeshRoleRegistryResult {
  ok: boolean;
  artifact: MeshRoleRegistryArtifact | null;
  refusal: MeshRoleRegistryRefusal | null;
}