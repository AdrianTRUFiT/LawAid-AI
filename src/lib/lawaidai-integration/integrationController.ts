import { buildLawAidAILaunchState } from "../lawaidai-launch";
import { buildLawAidAIHardeningSnapshot } from "../lawaidai-hardening";
import { deriveShellMode } from "./shellProjection";
import { deriveVisibleSections } from "./workspaceSections";
import { deriveShellPermissions } from "./activationPolicy";
import type {
  LawAidAICourseState,
  LawAidAIIntegrationSnapshot,
  LawAidAISubscriptionStateInput,
} from "./integrationContracts";

export function buildLawAidAIIntegrationSnapshot(args: {
  course: LawAidAICourseState;
  subscription: LawAidAISubscriptionStateInput;
  refusalInput: {
    expectedTargetEnvironment: string;
    fields: {
      matterId?: string;
      userId?: string;
      shellId?: string;
      targetEnvironment?: string;
    };
    hasReviewedShell: boolean;
    hasActivatedTransactionState: boolean;
    isDuplicateActivation: boolean;
    contradictoryState: boolean;
    blocked: boolean;
    trapped: boolean;
    financialMappingValid: boolean;
    queueReady: boolean;
    confirmationReady: boolean;
    reconciliationValid: boolean;
  };
  financialSnapshot: {
    payeeMapped: boolean;
    sourceMapped: boolean;
    queueReady: boolean;
    confirmationReady: boolean;
    anomalyPathReady: boolean;
    exactVsPartialReconciliationDefined: boolean;
  };
  consequenceAuthorized: boolean;
}): LawAidAIIntegrationSnapshot {
  const launch = buildLawAidAILaunchState({
    course: args.course,
    planId: args.subscription.planId,
    subscription: args.subscription.planId
      ? {
          subscriptionId: "integration_sub",
          customerRef: "integration_customer",
          planId: args.subscription.planId,
          startedAt: new Date().toISOString(),
          cancelAtPeriodEnd: false,
          currentPeriodStartsAt:
            args.subscription.subscriptionState.startsWith("active_") ||
            args.subscription.subscriptionState === "grace_period" ||
            args.subscription.subscriptionState === "canceled_pending_end"
              ? new Date().toISOString()
              : undefined,
          currentPeriodEndsAt:
            args.subscription.subscriptionState.startsWith("active_") ||
            args.subscription.subscriptionState === "grace_period" ||
            args.subscription.subscriptionState === "canceled_pending_end"
              ? new Date(Date.now() + 86400000).toISOString()
              : undefined,
          trialStartedAt:
            args.subscription.subscriptionState === "trial_active"
              ? new Date().toISOString()
              : undefined,
          trialEndsAt:
            args.subscription.subscriptionState === "trial_active"
              ? new Date(Date.now() + 86400000).toISOString()
              : undefined,
          paymentFailedAt:
            args.subscription.subscriptionState === "payment_failed"
              ? new Date().toISOString()
              : undefined,
          graceEndsAt:
            args.subscription.subscriptionState === "grace_period"
              ? new Date(Date.now() + 86400000).toISOString()
              : undefined,
        }
      : undefined,
  });

  const hardening = buildLawAidAIHardeningSnapshot({
    refusalInput: args.refusalInput,
    financialSnapshot: args.financialSnapshot,
    governedState: {
      courseBlocked: !!args.course.blocked,
      courseTrapped: !!args.course.trapped,
      consequenceAuthorized: args.consequenceAuthorized,
      subscriptionState: args.subscription.subscriptionState,
    },
  });

  const { shellMode, reason } = deriveShellMode({
    course: args.course,
    subscription: args.subscription,
    hardeningApproved: hardening.refusal.approved && hardening.financial.valid,
    launchReady: hardening.launchReady,
    consequenceAuthorized: args.consequenceAuthorized,
  });

  const visibleSections = deriveVisibleSections(shellMode);
  const permissions = deriveShellPermissions(shellMode);

  return {
    shellMode,
    canActivate: permissions.canActivate,
    canEdit: permissions.canEdit,
    canUseAI: permissions.canUseAI,
    isReadOnly: permissions.isReadOnly,
    showUpgradePrompt: permissions.showUpgradePrompt,
    reason,
    visibleSections,
    consequenceCheckpointId: launch.consequenceCheckpointId,
    launchReady: hardening.launchReady,
  };
}
