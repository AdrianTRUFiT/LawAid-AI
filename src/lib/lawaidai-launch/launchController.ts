import { deriveSubscriptionState } from "./subscriptionLifecycle";
import { deriveWorkspaceAccess } from "./accessPolicy";
import { getLawAidAIPlan } from "./lawaidaiPlans";
import type {
  LawAidAICourseReflection,
  LawAidAILaunchState,
  LawAidAIPlanId,
  SubscriptionRecord,
} from "./billingContracts";

export function buildLawAidAILaunchState(args: {
  course: LawAidAICourseReflection;
  planId?: LawAidAIPlanId;
  subscription?: SubscriptionRecord;
  now?: Date;
}): LawAidAILaunchState {
  const now = args.now ?? new Date();
  const subscriptionState = deriveSubscriptionState(args.subscription, now);
  const workspace = deriveWorkspaceAccess(args.course, subscriptionState);
  const plan = args.planId ? getLawAidAIPlan(args.planId) : args.subscription ? getLawAidAIPlan(args.subscription.planId) : undefined;

  return {
    plan,
    subscriptionState,
    workspace,
    isCommerciallyActive:
      subscriptionState === "trial_active" ||
      subscriptionState === "active_monthly" ||
      subscriptionState === "active_quarterly" ||
      subscriptionState === "active_annual" ||
      subscriptionState === "canceled_pending_end" ||
      subscriptionState === "grace_period",
    isTrial: subscriptionState === "trial_active",
    isReadOnly:
      subscriptionState === "payment_failed" ||
      subscriptionState === "expired_read_only" ||
      subscriptionState === "reactivation_required",
    requiresCheckout:
      subscriptionState === "none" ||
      subscriptionState === "checkout_pending",
    requiresReactivation:
      subscriptionState === "payment_failed" ||
      subscriptionState === "expired_read_only" ||
      subscriptionState === "reactivation_required",
    annualTrialEligible: plan?.id === "annual_pro",
    consequenceCheckpointId: args.course.consequenceCheckpointId,
  };
}
