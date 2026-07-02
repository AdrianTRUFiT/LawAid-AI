import type { MeshPaidServiceTruthArtifact } from "../../mesh-paid-service-truth-bridge/src/index.js";
import type { MeshServiceCatalogArtifact } from "../../mesh-service-catalog/src/index.js";
import type { MeshServicePlanMatrixArtifact } from "../../mesh-service-plan-matrix/src/index.js";

export type MeshEntitlementStatus =
  | "ENTITLED_ACTIVE"
  | "ENTITLED_HELD_REVIEW"
  | "ENTITLED_REFUSED";

export interface MeshServiceEntitlementResolverInput {
  subjectId: string;
  paidTruth: MeshPaidServiceTruthArtifact | null;
  service: MeshServiceCatalogArtifact | null;
  plan: MeshServicePlanMatrixArtifact | null;
}

export interface MeshServiceEntitlementArtifact {
  entitlementId: string;
  subjectId: string;
  paidTruthId: string;
  serviceCode: string;
  serviceCategory: string;
  planCode: string;
  entitlementStatus: MeshEntitlementStatus;
  serviceRights: string[];
  continuityPriorityGranted: boolean;
  accessClass: "active" | "held" | "blocked";
  transactionalAccessReady: boolean;
  reason: string;
  createdAt: string;
}

export interface MeshServiceEntitlementResolverRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "SERVICE_MISMATCH"
    | "PLAN_MISMATCH";
  refusalReason: string;
}

export interface MeshServiceEntitlementResolverResult {
  ok: boolean;
  artifact: MeshServiceEntitlementArtifact | null;
  refusal: MeshServiceEntitlementResolverRefusal | null;
}