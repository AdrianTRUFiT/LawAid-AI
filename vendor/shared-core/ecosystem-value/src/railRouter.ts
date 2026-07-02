import type { RailCapability, RailType } from "./contracts.js";

export function selectBestRail(input: {
  rails: RailCapability[];
  allowedRails: RailType[];
  jurisdictionCode: string;
  settlementCurrency: string;
}): RailCapability | null {
  const eligible = input.rails
    .filter(
      (r) =>
        r.enabled &&
        input.allowedRails.includes(r.railType) &&
        r.jurisdictions.includes(input.jurisdictionCode) &&
        r.supportedSettlementCurrencies.includes(input.settlementCurrency),
    )
    .sort((a, b) => a.priority - b.priority);

  return eligible[0] ?? null;
}
