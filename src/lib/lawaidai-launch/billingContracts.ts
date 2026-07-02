export type LawAidAIPlanId = "monthly_flex" | "quarterly_plan" | "annual_pro";

export type BillingInterval = "month" | "quarter" | "year";

export type SubscriptionState =
  | "none"
  | "checkout_pending"
  | "trial_active"
  | "active_monthly"
  | "active_quarterly"
  | "active_annual"
  | "grace_period"
  | "payment_failed"
  | "expired_read_only"
  | "canceled_pending_end"
  | "reactivation_required";

export type WorkspaceGateState =
  | "onboarding"
  | "billing_required"
  | "trial_workspace"
  | "active_workspace"
  | "grace_workspace"
  | "read_only"
  | "blocked";

export interface LawAidAIPlan {
  id: LawAidAIPlanId;
  name: string;
  priceCents: number;
  interval: BillingInterval;
  trialDays: number;
  mainOffer: boolean;
  description: string;
  ctaLabel: string;
  features: string[];
}

export interface SubscriptionRecord {
  subscriptionId: string;
  customerRef: string;
  planId: LawAidAIPlanId;
  startedAt: string;
  checkoutStartedAt?: string;
  trialStartedAt?: string;
  trialEndsAt?: string;
  currentPeriodStartsAt?: string;
  currentPeriodEndsAt?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  paymentFailedAt?: string;
  graceEndsAt?: string;
  lastPaymentAt?: string;
  lastPaymentProviderRef?: string;
}

export interface LawAidAICourseReflection {
  onboardingComplete: boolean;
  trialStarted: boolean;
  paidPending: boolean;
  activated: boolean;
  complete: boolean;
  blocked?: boolean;
  trapped?: boolean;
  consequenceCheckpointId?: string;
}

export interface WorkspaceAccessPolicy {
  gateState: WorkspaceGateState;
  canEdit: boolean;
  canUseAI: boolean;
  canUpload: boolean;
  canExport: boolean;
  canViewAll: boolean;
  reason: string;
  primaryActionLabel?: string;
}

export interface LawAidAILaunchState {
  plan?: LawAidAIPlan;
  subscriptionState: SubscriptionState;
  workspace: WorkspaceAccessPolicy;
  isCommerciallyActive: boolean;
  isTrial: boolean;
  isReadOnly: boolean;
  requiresCheckout: boolean;
  requiresReactivation: boolean;
  annualTrialEligible: boolean;
  consequenceCheckpointId?: string;
}
