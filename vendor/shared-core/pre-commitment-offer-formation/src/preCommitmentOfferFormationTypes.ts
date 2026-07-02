import type { ReleaseWindowSourceSelectionArtifact } from "../../release-window-source-selection-bridge/src/index.js";

export type PreCommitmentOfferStatus =
  | "OFFER_READY"
  | "OFFER_HELD"
  | "OFFER_REFUSED";

export type OfferClass =
  | "pooled_offer"
  | "isolated_offer"
  | "none";

export interface PreCommitmentOfferFormationInput {
  subjectId: string;
  sourceSelection: ReleaseWindowSourceSelectionArtifact | null;
  offerAmountMinor: number;
  currency: string;
}

export interface PreCommitmentOfferArtifact {
  preCommitmentOfferId: string;
  subjectId: string;
  preCommitmentOfferStatus: PreCommitmentOfferStatus;
  offerClass: OfferClass;
  selectedSourceId: string | null;
  offerAmountMinor: number;
  currency: string;
  commitmentWindowOpen: boolean;
  reason: string;
  createdAt: string;
}

export interface PreCommitmentOfferFormationRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_OFFER";
  refusalReason: string;
}

export interface PreCommitmentOfferFormationResult {
  ok: boolean;
  artifact: PreCommitmentOfferArtifact | null;
  refusal: PreCommitmentOfferFormationRefusal | null;
}