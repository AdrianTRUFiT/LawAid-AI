import type {
  LocalizationDefaults,
  NormalizedField,
} from "./inputTrustTypes.js";
import {
  defaultLocalization,
  normalizeCountry,
  normalizeCurrency,
  normalizeLanguage,
  normalizeUnitSystem,
} from "./inputTrustUtils.js";

export function deriveLocalization(input: {
  normalizedFields: NormalizedField[];
}): LocalizationDefaults {
  const defaults = defaultLocalization();

  const getValue = (key: string): string | undefined => {
    const found = input.normalizedFields.find((x) => x.semanticType === key);
    return typeof found?.normalizedValue === "string" ? found.normalizedValue : undefined;
  };

  const countryCode = getValue("country") ?? defaults.countryCode;
  const languageCode = getValue("language") ?? defaults.languageCode;
  const currencyCode = getValue("currency") ?? defaults.currencyCode;
  const unitSystemRaw = getValue("unit_system") ?? defaults.unitSystem;

  const normalizedCountryCode = normalizeCountry(countryCode);
  const normalizedLanguageCode = normalizeLanguage(languageCode);
  const normalizedCurrencyCode = normalizeCurrency(currencyCode);
  const normalizedUnitSystem = normalizeUnitSystem(unitSystemRaw);

  return {
    countryCode: normalizedCountryCode,
    languageCode: normalizedLanguageCode,
    currencyCode: normalizedCurrencyCode,
    unitSystem: normalizedUnitSystem,
    locale: `${normalizedLanguageCode}-${normalizedCountryCode}`,
  };
}