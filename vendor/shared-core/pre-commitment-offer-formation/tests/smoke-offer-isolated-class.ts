import { runPreCommitmentOfferFormation } from "../src/index.js";

const result = runPreCommitmentOfferFormation({
  subjectId: "offer_005",
  offerAmountMinor: 18000,
  currency: "USD",
  sourceSelection: {
    sourceSelectionId: "source_selection_offer_005",
    subjectId: "offer_005",
    sourceSelectionStatus: "SOURCE_SELECTED",
    selectedSourceId: "iso_a",
    selectedSourceType: "isolated",
    releaseWindowClass: "scheduled",
    releaseEligible: true,
    sourceCompositeScore: 0.81,
    reason: "Selected.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.offerClass !== "isolated_offer") {
  throw new Error("Expected isolated offer class.");
}

console.log("SMOKE_OFFER_ISOLATED_CLASS=PASS");