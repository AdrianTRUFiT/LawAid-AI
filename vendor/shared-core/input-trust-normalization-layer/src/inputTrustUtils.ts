import type { LocalizationDefaults, NormalizedPaymentStyle } from "./inputTrustTypes.js";

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

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortDeep);
  }

  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortDeep((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }

  return value;
}

export function sha256(input: string): string {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash).toString(16).padStart(8, "0");
  return `${normalized}${normalized}${normalized}${normalized}${normalized}${normalized}${normalized}${normalized}`;
}

export function normalizeCountry(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeLanguage(value: string): string {
  return value.trim().toLowerCase().split("-")[0];
}

export function normalizeCurrency(value: string): string {
  return value.trim().toUpperCase();
}

export function normalizeUnitSystem(value: string): "imperial" | "metric" {
  const v = value.trim().toLowerCase();
  if (["metric", "si", "eu"].includes(v)) return "metric";
  return "imperial";
}

export function normalizePaymentStyle(value: string): NormalizedPaymentStyle {
  const v = value.trim().toLowerCase();

  if (["card", "credit_card", "debit_card"].includes(v)) return "card";
  if (["bank", "bank_transfer", "wire", "ach"].includes(v)) return "bank_transfer";
  if (["wallet", "digital_wallet"].includes(v)) return "wallet";
  if (["cashless"].includes(v)) return "cashless";
  if (["mixed"].includes(v)) return "mixed";

  return "other";
}