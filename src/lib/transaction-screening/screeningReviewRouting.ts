import type { ScreeningReviewPacket, ScreeningResult } from "./screeningTypes";

export function buildReviewPacket(result: ScreeningResult): ScreeningReviewPacket | null {
  if (result.decision !== "REVIEW_REQUIRED" && result.decision !== "HOLD") {
    return null;
  }

  return {
    transactionId: result.transactionId,
    decision: result.decision,
    summary: result.summary,
    hitCount: result.hits.length,
    hits: result.hits,
    reviewerNotesAllowed: true,
    blockedUntilResolution: true,
  };
}
