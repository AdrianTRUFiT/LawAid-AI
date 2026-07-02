import { normalizeBillingSignal } from "./normalizeBillingSignal";
import {
  createEmptyBillingTimelineState,
  reduceBillingEvent,
} from "./billingReducer";
import type {
  BillingTimelineState,
  RawBillingSignal,
} from "./billingContracts";

export function buildBillingTimeline(
  customerRef: string,
  signals: RawBillingSignal[]
): BillingTimelineState {
  let state = createEmptyBillingTimelineState(customerRef);

  for (const signal of signals) {
    const normalized = normalizeBillingSignal(signal);
    if (!normalized.accepted || !normalized.event) {
      continue;
    }
    state = reduceBillingEvent(state, normalized.event);
  }

  return state;
}
