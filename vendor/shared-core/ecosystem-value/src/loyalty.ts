import type { LoyaltySnapshot, SettlementRecord } from "./contracts.js";

export function buildLoyaltySnapshot(
  walletId: string,
  settlements: SettlementRecord[],
): LoyaltySnapshot {
  const settled = settlements.filter((s) => s.status === "settled");
  const totalSettlementValue = settled.reduce((sum, s) => sum + s.settlementAmount, 0);
  const earnedLoyaltyValue = Number((totalSettlementValue * 0.01).toFixed(2));
  const trustScore = Math.min(100, Math.round(settled.length * 5 + totalSettlementValue / 100));

  return {
    walletId,
    settledTransactionCount: settled.length,
    totalSettlementValue: Number(totalSettlementValue.toFixed(2)),
    earnedLoyaltyValue,
    trustScore,
  };
}
