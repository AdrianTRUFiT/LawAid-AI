import type {
  AgreementSealReadiness,
  InputBundle,
  TrustClassification,
} from "./inputTrustTypes.js";
import { REQUIRED_SEAL_KEYS } from "./normalizationContracts.js";
import { sha256, stableStringify } from "./inputTrustUtils.js";

export function evaluateAgreementSealReadiness(input: {
  bundle: InputBundle;
  classifications: TrustClassification[];
  normalizedContext: {
    origin?: string;
    destination?: string;
    localization: {
      languageCode: string;
      currencyCode: string;
      unitSystem: "imperial" | "metric";
    };
    conflictMessages: string[];
  };
}): AgreementSealReadiness {
  const securingSourcePresent = input.classifications.some(
    (x) => x.sourceClass === "securing",
  );

  const governedSecuringSourcePresent = input.classifications.some(
    (x) => x.secureAllowed,
  );

  const missingRequiredKeys: string[] = [];

  if (!input.normalizedContext.origin) missingRequiredKeys.push("origin");
  if (!input.normalizedContext.destination) missingRequiredKeys.push("destination");
  if (!input.normalizedContext.localization.languageCode) missingRequiredKeys.push("language");
  if (!input.normalizedContext.localization.currencyCode) missingRequiredKeys.push("currency");
  if (!input.normalizedContext.localization.unitSystem) missingRequiredKeys.push("unit_system");

  const sealReady =
    governedSecuringSourcePresent &&
    missingRequiredKeys.length === 0 &&
    input.normalizedContext.conflictMessages.length === 0;

  const sealReason = sealReady
    ? "Governed securing input present and normalized agreement context is complete."
    : input.normalizedContext.conflictMessages.length > 0
    ? "Agreement seal refused because normalized inputs conflict."
    : !governedSecuringSourcePresent
    ? "Agreement seal not ready because no governed securing input exists."
    : "Agreement seal not ready because required normalized fields are missing.";

  const sealHash = sealReady
    ? sha256(
        stableStringify({
          bundleId: input.bundle.bundleId,
          scenarioId: input.bundle.scenarioId,
          requiredKeys: REQUIRED_SEAL_KEYS,
          origin: input.normalizedContext.origin,
          destination: input.normalizedContext.destination,
          localization: input.normalizedContext.localization,
        }),
      )
    : undefined;

  return {
    sealReady,
    securingSourcePresent,
    governedSecuringSourcePresent,
    missingRequiredKeys,
    conflictMessages: input.normalizedContext.conflictMessages,
    sealReason,
    sealHash,
  };
}