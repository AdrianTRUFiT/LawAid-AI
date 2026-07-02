import { runPreCommitmentOfferFormation } from "../src/index.js";

const result = runPreCommitmentOfferFormation({
  subjectId: "offer_001",
  offerAmountMinor: 25000,
  currency: "USD",
  sourceSelection: {
    sourceSelectionId: "source_selection_offer_001",
    subjectId: "offer_001",
    sourceSelectionStatus: "SOURCE_SELECTED",
    selectedSourceId: "pool_a",
    selectedSourceType: "pooled",
    releaseWindowClass: "immediate",
    releaseEligible: true,
    sourceCompositeScore: 0.85,
    reason: "Selected.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.preCommitmentOfferStatus !== "OFFER_READY") {
  throw new Error("Expected selected source offer pass.");
}

console.log("SMOKE_OFFER_SELECTED_PASS=PASS");