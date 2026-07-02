export type LawAidAIRefusalCode =
  | "WRONG_TARGET"
  | "UNAPPROVED_SHELL"
  | "MISSING_REQUIRED_FIELD"
  | "CONTRADICTORY_STATE"
  | "DUPLICATE_ACTIVATION"
  | "TRAPPED_STATE"
  | "BLOCKED_STATE"
  | "MISSING_ACTIVATED_TRANSACTION_STATE"
  | "FINANCIAL_MAPPING_INVALID"
  | "QUEUE_NOT_READY"
  | "CONFIRMATION_NOT_READY"
  | "RECONCILIATION_INVALID";

export type HardeningDecision = "approved" | "refused" | "review_required";

export type LawAidAIShellGate =
  | "blocked"
  | "read_only"
  | "review_required"
  | "activation_ready"
  | "active_workspace";

export interface LawAidAIRequiredFields {
  matterId?: string;
  userId?: string;
  shellId?: string;
  targetEnvironment?: string;
}

export interface LawAidAIRefusalInput {
  expectedTargetEnvironment: string;
  fields: LawAidAIRequiredFields;
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
}

export interface LawAidAIRefusalResult {
  decision: HardeningDecision;
  approved: boolean;
  refusalCodes: LawAidAIRefusalCode[];
  explanation: string[];
}

export interface FinancialWorkspaceSnapshot {
  payeeMapped: boolean;
  sourceMapped: boolean;
  queueReady: boolean;
  confirmationReady: boolean;
  anomalyPathReady: boolean;
  exactVsPartialReconciliationDefined: boolean;
}

export interface FinancialWorkspaceValidation {
  valid: boolean;
  codes: LawAidAIRefusalCode[];
  explanation: string[];
}

export interface LawAidAIGovernedStateInput {
  courseBlocked: boolean;
  courseTrapped: boolean;
  consequenceAuthorized: boolean;
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
  refusal: LawAidAIRefusalResult;
}

export interface LawAidAIHardeningSnapshot {
  refusal: LawAidAIRefusalResult;
  financial: FinancialWorkspaceValidation;
  shellGate: LawAidAIShellGate;
  launchReady: boolean;
}
