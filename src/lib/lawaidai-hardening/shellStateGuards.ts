import type {
  LawAidAIGovernedStateInput,
  LawAidAIShellGate,
} from "./hardeningContracts";

export function deriveLawAidAIShellGate(input: LawAidAIGovernedStateInput): LawAidAIShellGate {
  if (!input.refusal.approved || input.courseBlocked || input.courseTrapped) {
    return "blocked";
  }

  if (
    input.subscriptionState === "payment_failed" ||
    input.subscriptionState === "expired_read_only" ||
    input.subscriptionState === "reactivation_required"
  ) {
    return "read_only";
  }

  if (
    input.subscriptionState === "none" ||
    input.subscriptionState === "checkout_pending"
  ) {
    return "review_required";
  }

  if (!input.consequenceAuthorized) {
    return "activation_ready";
  }

  return "active_workspace";
}
