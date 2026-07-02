import type {
  LawAidAICourseState,
  LawAidAIShellMode,
  LawAidAISubscriptionStateInput,
} from "./integrationContracts";

export function deriveShellMode(args: {
  course: LawAidAICourseState;
  subscription: LawAidAISubscriptionStateInput;
  hardeningApproved: boolean;
  launchReady: boolean;
  consequenceAuthorized: boolean;
}): { shellMode: LawAidAIShellMode; reason: string } {
  const { course, subscription, hardeningApproved, launchReady, consequenceAuthorized } = args;

  if (!hardeningApproved || course.blocked || course.trapped) {
    return {
      shellMode: "blocked",
      reason: "Governed hardening or course state is blocking shell progression.",
    };
  }

  if (
    subscription.subscriptionState === "payment_failed" ||
    subscription.subscriptionState === "expired_read_only" ||
    subscription.subscriptionState === "reactivation_required"
  ) {
    return {
      shellMode: "read_only",
      reason: "Subscription is inactive; shell remains readable but editing is disabled.",
    };
  }

  if (
    subscription.subscriptionState === "none" ||
    subscription.subscriptionState === "checkout_pending"
  ) {
    return {
      shellMode: "billing_gate",
      reason: "Billing is required before the full workspace can become active.",
    };
  }

  if (!consequenceAuthorized || !course.activated || !launchReady) {
    return {
      shellMode: "activation_ready",
      reason: "Commercial state is present, but full shell activation is still governed by consequence and readiness.",
    };
  }

  return {
    shellMode: "active",
    reason: "Shell is active from governed truth, valid commercial state, and activation readiness.",
  };
}
