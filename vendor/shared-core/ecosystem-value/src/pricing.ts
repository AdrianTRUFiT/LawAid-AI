import type { RealValuePrice, ValueBalance, ValueConversionRate } from "./contracts.js";

export function buildRealValuePrice(input: {
  merchantId: string;
  realValueUnits: number;
  displayCurrency: string;
  settlementCurrency: string;
  realValueToDisplayRate: number;
  realValueToSettlementRate: number;
  occurredAt?: string;
}): RealValuePrice {
  return {
    priceId: `rvp-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    merchantId: input.merchantId,
    realValueUnits: input.realValueUnits,
    displayCurrency: input.displayCurrency,
    displayAmount: Number((input.realValueUnits * input.realValueToDisplayRate).toFixed(2)),
    settlementCurrency: input.settlementCurrency,
    settlementAmount: Number((input.realValueUnits * input.realValueToSettlementRate).toFixed(2)),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
}

export function getUnitsRequired(input: {
  unitCode: string;
  settlementCurrency: string;
  settlementAmount: number;
  rates: ValueConversionRate[];
}): number {
  const rate = input.rates.find(
    (r) => r.unitCode === input.unitCode && r.settlementCurrency === input.settlementCurrency,
  );
  if (!rate || rate.settlementPerUnit <= 0) return Number.POSITIVE_INFINITY;
  return input.settlementAmount / rate.settlementPerUnit;
}

export function getSettlementValueFromBalance(input: {
  balance: ValueBalance;
  settlementCurrency: string;
  rates: ValueConversionRate[];
}): number {
  const rate = input.rates.find(
    (r) => r.unitCode === input.balance.unitCode && r.settlementCurrency === input.settlementCurrency,
  );
  if (!rate) return 0;
  return Number((input.balance.amount * rate.settlementPerUnit).toFixed(2));
}
