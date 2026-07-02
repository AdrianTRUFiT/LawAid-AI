import type { ActivatedTransactionState } from "../fundtracker/types";
import type { GovernedFinancialOversightState } from "./types";
import { buildOversightState } from "./oversightEngine";

export interface FinTechionStoreState {
  transactions: ActivatedTransactionState[];
  latestOversightState: GovernedFinancialOversightState | null;
}

const state: FinTechionStoreState = {
  transactions: [],
  latestOversightState: null,
};

export function getFinTechionStoreState(): FinTechionStoreState {
  return {
    transactions: [...state.transactions],
    latestOversightState: state.latestOversightState,
  };
}

export function resetFinTechionStore(): void {
  state.transactions.length = 0;
  state.latestOversightState = null;
}

export function ingestTransactionSummary(
  transaction: ActivatedTransactionState,
): void {
  state.transactions.push(transaction);
}

export function buildAndStoreOversightState(
  period: string,
  refundExposure = 0,
  disputeExposure = 0,
): GovernedFinancialOversightState {
  const oversightState = buildOversightState({
    period,
    transactions: state.transactions,
    refundExposure,
    disputeExposure,
  });

  state.latestOversightState = oversightState;
  return oversightState;
}
