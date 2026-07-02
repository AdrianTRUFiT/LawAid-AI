import type { LocalizationDefaults } from "./workflowTypes.js";

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function defaultLocalization(): LocalizationDefaults {
  return {
    countryCode: "US",
    languageCode: "en",
    currencyCode: "USD",
    unitSystem: "imperial",
    locale: "en-US",
  };
}

export function mergeLocalization(
  partial?: Partial<LocalizationDefaults>,
): LocalizationDefaults {
  return {
    ...defaultLocalization(),
    ...(partial ?? {}),
  };
}