import type {
  RefusalDecision,
  UnifiedRefusalInput
} from "./refusalDecisionContracts";

export function unifiedRefusalGate(
  input: UnifiedRefusalInput = {}
): RefusalDecision {
  if (input.allowed === true) {
    return {
      result: "ALLOW",
      reasonCode: input.reasonCode ?? "ALLOW_REQUESTED",
      reason: input.reason ?? "Unified refusal gate allowed this action.",
      requiresHumanReview: false,
      metadata: input.metadata
    };
  }

  if (input.hold === true) {
    return {
      result: "HOLD_PROTECTED",
      reasonCode: input.reasonCode ?? "HOLD_PROTECTED_REVIEW_REQUIRED",
      reason: input.reason ?? "Unified refusal gate placed this action into protected hold.",
      requiresHumanReview: true,
      metadata: input.metadata
    };
  }

  if (input.recoverable === true) {
    return {
      result: "REFUSE_RECOVERABLE",
      reasonCode: input.reasonCode ?? "REFUSE_RECOVERABLE_REVIEW_REQUIRED",
      reason: input.reason ?? "Unified refusal gate recoverably refused this action.",
      requiresHumanReview: true,
      metadata: input.metadata
    };
  }

  return {
    result: "REFUSE_HARD",
    reasonCode: input.reasonCode ?? "REFUSE_HARD_DEFAULT",
    reason: input.reason ?? "Unified refusal gate hard-refused this action.",
    requiresHumanReview: true,
    metadata: input.metadata
  };
}
