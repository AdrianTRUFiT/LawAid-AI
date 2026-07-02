export type LawAidAIShellMode =
  | "blocked"
  | "read_only"
  | "billing_gate"
  | "activation_ready"
  | "active";

export interface LawAidAICourseState {
  onboardingComplete: boolean;
  trialStarted: boolean;
  paidPending: boolean;
  activated: boolean;
  complete: boolean;
  blocked?: boolean;
  trapped?: boolean;
  consequenceCheckpointId?: string;
}

export interface LawAidAISubscriptionStateInput {
  planId?: "monthly_flex" | "quarterly_plan" | "annual_pro";
  subscriptionState:
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
}

export interface LawAidAIShellSections {
  overview: boolean;
  checklist: boolean;
  evidence: boolean;
  timeline: boolean;
  costs: boolean;
  communications: boolean;
  billing: boolean;
  activation: boolean;
}

export interface LawAidAIIntegrationSnapshot {
  shellMode: LawAidAIShellMode;
  canActivate: boolean;
  canEdit: boolean;
  canUseAI: boolean;
  isReadOnly: boolean;
  showUpgradePrompt: boolean;
  reason: string;
  visibleSections: LawAidAIShellSections;
  consequenceCheckpointId?: string;
  launchReady: boolean;
}
