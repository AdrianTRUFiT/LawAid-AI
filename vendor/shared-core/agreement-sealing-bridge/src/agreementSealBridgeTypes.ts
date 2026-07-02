import type { InputTrustNormalizationResult } from "../../input-trust-normalization-layer/src/index.js";

export type AgreementSealStatus =
  | "SEALED"
  | "REFUSED";

export interface AgreementParty {
  role: "originator" | "counterparty" | "system";
  partyId: string;
}

export interface SealedAgreementArtifact {
  agreementId: string;
  bundleId: string;
  scenarioId: string;
  origin: string;
  destination: string;
  languageCode: string;
  currencyCode: string;
  unitSystem: "imperial" | "metric";
  locale: string;
  paymentStyle?: string;
  normalizedFieldCount: number;
  securingSourcePresent: boolean;
  governedSecuringSourcePresent: boolean;
  sealHash: string;
  continuityHash: string;
  createdAt: string;
  parties: AgreementParty[];
}

export interface AgreementSealRefusal {
  refusalCode:
    | "SEAL_NOT_READY"
    | "CONFLICT_PRESENT"
    | "MISSING_REQUIRED_FIELDS"
    | "NO_GOVERNED_SECURING_SOURCE";
  refusalReason: string;
  missingRequiredKeys: string[];
  conflictMessages: string[];
}

export interface AgreementSealingBridgeResult {
  status: AgreementSealStatus;
  sealedArtifact: SealedAgreementArtifact | null;
  refusal: AgreementSealRefusal | null;
  inputSummary: {
    scenarioId: string;
    bundleId: string;
    sealReady: boolean;
    conflictCount: number;
    normalizedFieldCount: number;
  };
}

export interface AgreementSealBridgeInput {
  normalizationResult: InputTrustNormalizationResult;
  parties?: AgreementParty[];
}