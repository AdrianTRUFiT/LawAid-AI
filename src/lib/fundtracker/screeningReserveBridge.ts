import type {
  ScreeningInput,
  ScreeningPolicy,
} from "../transaction-screening";
import {
  createDefaultScreeningPolicy,
  runTransactionScreening,
} from "../transaction-screening";
import type { ScreeningMode, ScreeningResult } from "../transaction-screening";

export interface FundTrackerScreeningBridgeInput {
  screeningEnabled?: boolean;
  mode?: ScreeningMode;
  screeningInput: ScreeningInput;
  policyOverride?: ScreeningPolicy;
}

export interface FundTrackerScreeningBridgeOutput {
  screeningApplied: boolean;
  screeningResult: ScreeningResult | null;
  mayProceed: boolean;
  requiresReview: boolean;
  isBlocked: boolean;
}

export function runFundTrackerScreeningReserveBridge(
  input: FundTrackerScreeningBridgeInput
): FundTrackerScreeningBridgeOutput {
  const enabled = input.screeningEnabled === true;
  const mode = input.mode ?? "disabled";

  if (!enabled || mode === "disabled") {
    return {
      screeningApplied: false,
      screeningResult: null,
      mayProceed: true,
      requiresReview: false,
      isBlocked: false,
    };
  }

  const policy = input.policyOverride ?? createDefaultScreeningPolicy(mode);
  const screeningResult = runTransactionScreening({
    input: input.screeningInput,
    policy,
  });

  return {
    screeningApplied: true,
    screeningResult,
    mayProceed: screeningResult.allowed,
    requiresReview: screeningResult.reviewRequired,
    isBlocked: screeningResult.blocked,
  };
}
