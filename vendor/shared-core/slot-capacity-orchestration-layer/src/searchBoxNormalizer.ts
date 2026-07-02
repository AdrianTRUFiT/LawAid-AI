import type { LogisticsSearchBoxQuery } from "./slotCapacityTypes.js";

export function normalizeSearchBoxQuery(
  query: LogisticsSearchBoxQuery,
): Required<LogisticsSearchBoxQuery> {
  return {
    queryId: query.queryId,
    origin: query.origin.trim(),
    destination: query.destination.trim(),
    whenNeeded: query.whenNeeded ?? "asap",
    cargoClass: query.cargoClass ?? "general",
    weightKg: query.weightKg ?? 100,
    volumeM3: query.volumeM3 ?? 1,
    urgencyScore: query.urgencyScore ?? 50,
    objective: query.objective ?? "balanced",
  };
}