import type { SemanticType } from "./inputTrustTypes.js";
import {
  normalizeCountry,
  normalizeCurrency,
  normalizeLanguage,
  normalizePaymentStyle,
  normalizeUnitSystem,
} from "./inputTrustUtils.js";

export function normalizeBySemanticType(input: {
  semanticType: SemanticType;
  value: string | number | boolean;
}): string | number | boolean {
  if (typeof input.value !== "string") {
    return input.value;
  }

  switch (input.semanticType) {
    case "country":
      return normalizeCountry(input.value);
    case "language":
      return normalizeLanguage(input.value);
    case "currency":
      return normalizeCurrency(input.value);
    case "unit_system":
      return normalizeUnitSystem(input.value);
    case "payment_style":
      return normalizePaymentStyle(input.value);
    default:
      return input.value.trim();
  }
}