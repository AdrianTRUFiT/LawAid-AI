import type { MeshPaidServiceTransactionIntentArtifact } from "../../mesh-paid-service-transaction-intent/src/index.js";

export type MeshProcessorEventStatus =
  | "processor_approved"
  | "processor_review"
  | "processor_refused";

export type MeshPaidTruthStatus =
  | "PAID_CONFIRMED"
  | "PAID_HELD_REVIEW"
  | "PAID_REFUSED";

export interface MeshProcessorAdjacentEvent {
  subjectId: string;
  processorReference: string;
  processorStatus: MeshProcessorEventStatus;
  amountMinor: number;
  currency: string;
  eventTimestamp: string;
}

export interface MeshPaidServiceTruthBridgeInput {
  subjectId: string;
  transactionIntent: MeshPaidServiceTransactionIntentArtifact | null;
  processorEvent: MeshProcessorAdjacentEvent | null;
}

export interface MeshPaidServiceTruthArtifact {
  paidTruthId: string;
  subjectId: string;
  transactionIntentId: string;
  processorReference: string;
  serviceCode: string;
  planCode: string;
  amountMinor: number;
  currency: string;
  paidTruthStatus: MeshPaidTruthStatus;
  commercialTruthReady: boolean;
  requiresReview: boolean;
  reason: string;
  createdAt: string;
}

export interface MeshPaidServiceTruthBridgeRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "AMOUNT_MISMATCH"
    | "CURRENCY_MISMATCH";
  refusalReason: string;
}

export interface MeshPaidServiceTruthBridgeResult {
  ok: boolean;
  artifact: MeshPaidServiceTruthArtifact | null;
  refusal: MeshPaidServiceTruthBridgeRefusal | null;
}