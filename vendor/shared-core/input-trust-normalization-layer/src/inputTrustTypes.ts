export type InputSourceClass =
  | "route_origin"
  | "supportive"
  | "coordination"
  | "securing";

export type InputTrustLevel =
  | "raw"
  | "supportive"
  | "reliable"
  | "governed";

export type SemanticType =
  | "origin"
  | "destination"
  | "country"
  | "language"
  | "currency"
  | "unit_system"
  | "location"
  | "payment_style"
  | "amount"
  | "date"
  | "free_text"
  | "generic";

export type NormalizedPaymentStyle =
  | "card"
  | "bank_transfer"
  | "wallet"
  | "cashless"
  | "mixed"
  | "other";

export interface InputVariable {
  key: string;
  semanticType: SemanticType;
  value: string | number | boolean;
}

export interface InputContribution {
  sourceId: string;
  sourceClass: InputSourceClass;
  sourceAuthenticated: boolean;
  governanceVerified: boolean;
  variables: InputVariable[];
}

export interface InputBundle {
  bundleId: string;
  scenarioId: string;
  contributions: InputContribution[];
}

export interface LocalizationDefaults {
  countryCode: string;
  languageCode: string;
  currencyCode: string;
  unitSystem: "imperial" | "metric";
  locale: string;
}

export interface TrustClassification {
  sourceId: string;
  sourceClass: InputSourceClass;
  trustLevel: InputTrustLevel;
  primaryRouteAuthority: boolean;
  enrichAllowed: boolean;
  coordinateAllowed: boolean;
  secureAllowed: boolean;
  reason: string;
}

export interface NormalizedField {
  key: string;
  semanticType: SemanticType;
  rawValue: string | number | boolean;
  normalizedValue: string | number | boolean;
  acceptedFromSourceId: string;
  acceptedFromTrustLevel: InputTrustLevel;
  reason: string;
}

export interface NormalizedAgreementContext {
  bundleId: string;
  scenarioId: string;
  localization: LocalizationDefaults;
  origin?: string;
  destination?: string;
  paymentStyle?: NormalizedPaymentStyle;
  normalizedFields: NormalizedField[];
  conflictMessages: string[];
}

export interface AgreementSealReadiness {
  sealReady: boolean;
  securingSourcePresent: boolean;
  governedSecuringSourcePresent: boolean;
  missingRequiredKeys: string[];
  conflictMessages: string[];
  sealReason: string;
  sealHash?: string;
}

export interface InputTrustNormalizationResult {
  trustClassifications: TrustClassification[];
  normalizedContext: NormalizedAgreementContext;
  agreementSealReadiness: AgreementSealReadiness;
}