import { findDuplicateCandidates } from "./duplicateDetection";
import { saveSupersession } from "./supersessionStore";
import { saveRetirementDecision } from "./retirementStore";
import { savePromotionDecision } from "./promotionStore";

const now = new Date().toISOString();

export function mergeExactDuplicates(approvedBy: string): string[] {
  const duplicates = findDuplicateCandidates();
  const outputs: string[] = [];

  for (const dup of duplicates) {
    outputs.push(
      saveSupersession({
        priorId: dup.primaryId,
        nextId: dup.duplicateId,
        rationale: dup.rationale,
        createdAt: now
      })
    );

    outputs.push(
      saveRetirementDecision({
        memoryId: dup.primaryId,
        retiredInFavorOf: dup.duplicateId,
        rationale: ["duplicate_cleanup", ...dup.rationale],
        approvedBy,
        createdAt: now
      })
    );

    outputs.push(
      savePromotionDecision({
        memoryId: dup.duplicateId,
        promoteTo: "active",
        rationale: ["duplicate_survivor_selected"],
        approvedBy,
        createdAt: now
      })
    );
  }

  return outputs;
}
