import { evaluateAgreementSealReadiness } from "./agreementSeal.js";
import { deriveLocalization } from "./localizationNormalizer.js";
import { buildNormalizedFields } from "./routeInputNormalizer.js";
import { classifyContribution } from "./trustClassifier.js";
import type {
  InputBundle,
  InputTrustNormalizationResult,
} from "./inputTrustTypes.js";

export function runInputTrustNormalization(
  bundle: InputBundle,
): InputTrustNormalizationResult {
  const trustClassifications = bundle.contributions.map(classifyContribution);

  const { normalizedFields, conflictMessages } = buildNormalizedFields({
    bundle,
    classifications: trustClassifications,
  });

  const localization = deriveLocalization({
    normalizedFields,
  });

  const getValue = (semanticType: string): string | undefined => {
    const found = normalizedFields.find((x) => x.semanticType === semanticType);
    return typeof found?.normalizedValue === "string" ? found.normalizedValue : undefined;
  };

  const paymentStyleRaw = getValue("payment_style");

  const normalizedContext = {
    bundleId: bundle.bundleId,
    scenarioId: bundle.scenarioId,
    localization,
    origin: getValue("origin"),
    destination: getValue("destination"),
    paymentStyle: paymentStyleRaw as InputTrustNormalizationResult["normalizedContext"]["paymentStyle"],
    normalizedFields,
    conflictMessages,
  };

  const agreementSealReadiness = evaluateAgreementSealReadiness({
    bundle,
    classifications: trustClassifications,
    normalizedContext,
  });

  return {
    trustClassifications,
    normalizedContext,
    agreementSealReadiness,
  };
}