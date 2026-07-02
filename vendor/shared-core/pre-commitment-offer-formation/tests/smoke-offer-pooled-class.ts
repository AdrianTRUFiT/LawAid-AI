import { runPreCommitmentOfferFormation } from "../src/index.js";

const result = runPreCommitmentOfferFormation({
  subjectId: "offer_004",
  offerAmountMinor: 25000,
  currency: "USD",
  sourceSelection: {
    sourceSelectionId: "source_selection_offer_004",
    subjectId: "offer_004",
    sourceSelectionStatus: "SOURCE_SELECTED",
    selectedSourceId: "pool_a",
    selectedSourceType: "pooled",
    releaseWindowClass: "scheduled",
    releaseEligible: true,
    sourceCompositeScore: 0.88,
    reason: "Selected.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.offerClass !== "pooled_offer") {
  throw new Error("Expected pooled offer class.");
}

console.log("SMOKE_OFFER_POOLED_CLASS=PASS");