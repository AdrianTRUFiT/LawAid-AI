import { runPreCommitmentOfferFormation } from "../src/index.js";

const result = runPreCommitmentOfferFormation({
  subjectId: "offer_002",
  offerAmountMinor: 25000,
  currency: "USD",
  sourceSelection: {
    sourceSelectionId: "source_selection_offer_002",
    subjectId: "offer_002",
    sourceSelectionStatus: "SOURCE_HELD",
    selectedSourceId: "pool_b",
    selectedSourceType: "pooled",
    releaseWindowClass: "delayed",
    releaseEligible: false,
    sourceCompositeScore: 0.82,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.preCommitmentOfferStatus !== "OFFER_HELD") {
  throw new Error("Expected held source offer hold.");
}

console.log("SMOKE_OFFER_HELD=PASS");