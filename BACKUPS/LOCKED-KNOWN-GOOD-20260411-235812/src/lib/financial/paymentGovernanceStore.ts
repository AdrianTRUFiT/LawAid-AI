import type { PreProcessorGovernanceState } from '../../types/preProcessorPayments';

const STORAGE_PREFIX = 'lawaidai-preprocessor-governance';

function nowIso() {
  return new Date().toISOString();
}

function storageKey(workspaceId: string) {
  return `${STORAGE_PREFIX}:${workspaceId}`;
}

function safeState(
  state: Partial<PreProcessorGovernanceState> & { workspaceId: string }
): PreProcessorGovernanceState {
  return {
    workspaceId: state.workspaceId,
    paymentIntents: state.paymentIntents ?? [],
    authorizations: state.authorizations ?? [],
    transactions: state.transactions ?? [],
    paymentSources: state.paymentSources ?? [],
    authorizationRules: state.authorizationRules ?? [],
    scheduledTransactions: state.scheduledTransactions ?? [],
    processingRecords: state.processingRecords ?? [],
    preProcessorReviews: state.preProcessorReviews ?? [],
    anomalies: state.anomalies ?? [],
    updatedAt: state.updatedAt ?? nowIso(),
  };
}

export type PaymentGovernanceState = PreProcessorGovernanceState;

export function createEmptyPaymentGovernanceState(
  workspaceId: string
): PaymentGovernanceState {
  return {
    workspaceId,
    paymentIntents: [],
    authorizations: [],
    transactions: [],
    paymentSources: [],
    authorizationRules: [],
    scheduledTransactions: [],
    processingRecords: [],
    preProcessorReviews: [],
    anomalies: [],
    updatedAt: nowIso(),
  };
}

export function loadPaymentGovernanceState(
  workspaceId: string
): PaymentGovernanceState {
  if (typeof window === 'undefined') {
    return createEmptyPaymentGovernanceState(workspaceId);
  }

  const raw = window.localStorage.getItem(storageKey(workspaceId));
  if (!raw) {
    return createEmptyPaymentGovernanceState(workspaceId);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PaymentGovernanceState>;
    return safeState({
      ...parsed,
      workspaceId,
    });
  } catch {
    return createEmptyPaymentGovernanceState(workspaceId);
  }
}

export function savePaymentGovernanceState(
  state: PaymentGovernanceState
): void {
  if (typeof window === 'undefined') return;

  const next = safeState(state);
  window.localStorage.setItem(storageKey(state.workspaceId), JSON.stringify(next));
}
