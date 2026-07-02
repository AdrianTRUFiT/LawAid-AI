import type {
  LogisticsSearchQuery,
  NormalizedSearchQuery,
} from "./logisticsSearchTypes.js";

export function normalizeSearchQuery(
  query: LogisticsSearchQuery,
): NormalizedSearchQuery {
  const countryCode = query.localization?.countryCode ?? "US";
  const languageCode = query.localization?.languageCode ?? "en";
  const currencyCode = query.localization?.currencyCode ?? "USD";
  const unitSystem = query.localization?.unitSystem ?? "imperial";
  const locale = query.localization?.locale ?? `${languageCode}-${countryCode}`;

  return {
    queryId: query.queryId,
    origin: query.origin.trim(),
    destination: query.destination.trim(),
    objective: query.objective,
    weightKg: query.weightKg ?? 100,
    volumeM3: query.volumeM3 ?? 1,
    urgencyScore: query.urgencyScore ?? 50,
    budgetLimit: query.budgetLimit ?? null,
    maxDelayRisk: query.maxDelayRisk ?? null,
    preferredModes: query.preferredModes ?? [],
    localization: {
      countryCode,
      languageCode,
      currencyCode,
      unitSystem,
      locale,
    },
  };
}