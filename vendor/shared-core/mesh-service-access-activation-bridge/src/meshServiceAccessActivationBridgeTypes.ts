import type { MeshServiceEntitlementArtifact } from "../../mesh-service-entitlement-resolver/src/index.js";

export type MeshAccessActivationStatus =
  | "ACCESS_ACTIVE"
  | "ACCESS_HELD"
  | "ACCESS_BLOCKED";

export interface MeshServiceAccessActivationBridgeInput {
  subjectId: string;
  entitlement: MeshServiceEntitlementArtifact | null;
}

export interface MeshServiceAccessActivationArtifact {
  accessActivationId: string;
  subjectId: string;
  entitlementId: string;
  serviceCode: string;
  planCode: string;
  accessActivationStatus: MeshAccessActivationStatus;
  serviceReady: boolean;
  continuityPriorityActive: boolean;
  activationRights: string[];
  environmentClass: "live" | "held" | "blocked";
  reason: string;
  createdAt: string;
}

export interface MeshServiceAccessActivationBridgeRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface MeshServiceAccessActivationBridgeResult {
  ok: boolean;
  artifact: MeshServiceAccessActivationArtifact | null;
  refusal: MeshServiceAccessActivationBridgeRefusal | null;
}