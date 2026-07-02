import type { MeshPaidTruthStatus } from "./meshPaidServiceTruthBridgeTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makePaidTruthId(
  subjectId: string,
  transactionIntentId: string,
  processorReference: string,
): string {
  return `mesh_paid_truth_${subjectId}_${transactionIntentId}_${processorReference}`;
}

export function mapProcessorStatusToTruth(
  processorStatus: "processor_approved" | "processor_review" | "processor_refused",
): MeshPaidTruthStatus {
  switch (processorStatus) {
    case "processor_approved":
      return "PAID_CONFIRMED";
    case "processor_review":
      return "PAID_HELD_REVIEW";
    case "processor_refused":
      return "PAID_REFUSED";
  }
}