export type OfferCode =
  | "TRIAL_CORE"
  | "PAID_CORE"
  | "MODULE_ADDON";

export type OfferTerm =
  | "trial_14d"
  | "monthly"
  | "annual";

export interface OfferToEntitlementInput {
  subjectId: string;
  offerCode: OfferCode | string;
  offerTerm: OfferTerm | string;
}

export interface EntitlementPackageArtifact {
  entitlementPackageId: string;
  subjectId: string;
  offerCode: OfferCode;
  offerTerm: OfferTerm;
  rights: string[];
  durationDays: number;
  downgradeRule: string;
  closureRule: string;
  archiveExportRule: string;
  reentryRule: string;
  createdAt: string;
}

export interface OfferToEntitlementRefusal {
  refusalCode:
    | "MISSING_OFFER"
    | "INVALID_TERM";
  refusalReason: string;
}

export interface OfferToEntitlementResult {
  ok: boolean;
  artifact: EntitlementPackageArtifact | null;
  refusal: OfferToEntitlementRefusal | null;
}