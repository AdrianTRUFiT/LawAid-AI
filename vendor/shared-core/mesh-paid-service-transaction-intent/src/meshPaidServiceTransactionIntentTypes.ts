import type { MeshServiceCatalogArtifact } from "../../mesh-service-catalog/src/index.js";
import type { MeshServicePlanMatrixArtifact } from "../../mesh-service-plan-matrix/src/index.js";

export type MeshTransactionIntentClass =
  | "subscription_intent"
  | "metered_intent"
  | "shared_group_intent";

export interface MeshPaidServiceTransactionIntentInput {
  subjectId: string;
  service: MeshServiceCatalogArtifact | null;
  plan: MeshServicePlanMatrixArtifact | null;
  amountMinor: number;
  currency: string;
}

export interface MeshPaidServiceTransactionIntentArtifact {
  transactionIntentId: string;
  subjectId: string;
  serviceCode: string;
  serviceCategory: string;
  planCode: string;
  transactionIntentClass: MeshTransactionIntentClass;
  amountMinor: number;
  currency: string;
  transactionalEligible: boolean;
  continuityPriorityRequested: boolean;
  reason: string;
  createdAt: string;
}

export interface MeshPaidServiceTransactionIntentRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "CATEGORY_NOT_ALLOWED"
    | "INVALID_AMOUNT";
  refusalReason: string;
}

export interface MeshPaidServiceTransactionIntentResult {
  ok: boolean;
  artifact: MeshPaidServiceTransactionIntentArtifact | null;
  refusal: MeshPaidServiceTransactionIntentRefusal | null;
}