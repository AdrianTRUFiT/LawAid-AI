import type {
  LawAidAICourseReflection,
  WorkspaceAccessPolicy,
  WorkspaceGateState,
  SubscriptionState,
} from "./billingContracts";

function buildPolicy(
  gateState: WorkspaceGateState,
  reason: string,
  overrides?: Partial<WorkspaceAccessPolicy>
): WorkspaceAccessPolicy {
  return {
    gateState,
    canEdit: false,
    canUseAI: false,
    canUpload: false,
    canExport: false,
    canViewAll: true,
    reason,
    ...overrides,
  };
}

export function deriveWorkspaceAccess(
  course: LawAidAICourseReflection,
  subscriptionState: SubscriptionState
): WorkspaceAccessPolicy {
  if (course.blocked || course.trapped) {
    return buildPolicy(
      "blocked",
      course.trapped
        ? "Course state is trapped. Workspace progression is refused until the trust path is cleared."
        : "Course state is blocked. Workspace progression is refused until the required path is complete.",
      {
        canViewAll: false,
        primaryActionLabel: "Resolve blocked state",
      }
    );
  }

  if (!course.onboardingComplete) {
    return buildPolicy("onboarding", "User is still completing governed onboarding.", {
      canEdit: true,
      canUpload: true,
      primaryActionLabel: "Continue onboarding",
    });
  }

  if (subscriptionState === "trial_active") {
    return buildPolicy("trial_workspace", "Annual trial is active. Full trial workspace is available.", {
      canEdit: true,
      canUseAI: true,
      canUpload: true,
      canExport: true,
      primaryActionLabel: "Continue trial workspace",
    });
  }

  if (
    subscriptionState === "active_monthly" ||
    subscriptionState === "active_quarterly" ||
    subscriptionState === "active_annual" ||
    subscriptionState === "canceled_pending_end"
  ) {
    return buildPolicy("active_workspace", "Paid subscription is active. Full workspace is available.", {
      canEdit: true,
      canUseAI: true,
      canUpload: true,
      canExport: true,
      primaryActionLabel: "Open workspace",
    });
  }

  if (subscriptionState === "grace_period") {
    return buildPolicy("grace_workspace", "Payment issue detected. Access remains temporarily available during grace period.", {
      canEdit: true,
      canUseAI: true,
      canUpload: true,
      canExport: true,
      primaryActionLabel: "Update billing",
    });
  }

  if (
    subscriptionState === "payment_failed" ||
    subscriptionState === "expired_read_only" ||
    subscriptionState === "reactivation_required"
  ) {
    return buildPolicy("read_only", "Subscription is inactive. Records remain, but editing is locked until reactivation.", {
      canEdit: false,
      canUseAI: false,
      canUpload: false,
      canExport: true,
      canViewAll: true,
      primaryActionLabel: "Reactivate access",
    });
  }

  return buildPolicy("billing_required", "Workspace is ready for activation, but billing has not been completed.", {
    canEdit: false,
    canUseAI: false,
    canUpload: false,
    canExport: false,
    canViewAll: true,
    primaryActionLabel: "Choose plan",
  });
}
