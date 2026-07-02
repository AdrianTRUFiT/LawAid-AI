export type ModuleState =
  | "ONLINE"
  | "OFFLINE"
  | "DEGRADED"
  | "CORRUPT"
  | "UNKNOWN";

export type FailureAction =
  | "CONTINUE"
  | "READ_ONLY"
  | "SAFE_HOLD"
  | "REFUSE"
  | "ISOLATE"
  | "REQUIRE_REVALIDATION";

export type FailureRule = {
  module: string;
  state: ModuleState;
  action: FailureAction;
  reason: string;
  canExecuteConsequence: boolean;
  canDisplayFrontend: boolean;
  canWriteLedger: boolean;
};

export const FAILURE_RULES: FailureRule[] = [
  {
    module: "AI_TRACK",
    state: "OFFLINE",
    action: "REFUSE",
    reason: "IDENTITY_USAGE_GATE_UNAVAILABLE",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "UTILITY_CONTAINER",
    state: "OFFLINE",
    action: "REFUSE",
    reason: "PROJECT_BOX_VALIDATION_UNAVAILABLE",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "SMART_UTILITY",
    state: "DEGRADED",
    action: "SAFE_HOLD",
    reason: "SMART_PROFILE_REVALIDATION_REQUIRED",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "PERMISSION_MATRIX",
    state: "OFFLINE",
    action: "REFUSE",
    reason: "PERMISSION_GATE_UNAVAILABLE",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "EXECUTION_CONTEXT",
    state: "UNKNOWN",
    action: "SAFE_HOLD",
    reason: "CONTEXT_FRESHNESS_UNKNOWN",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "HIL_SWITCHYARD",
    state: "DEGRADED",
    action: "REFUSE",
    reason: "EXECUTION_SWITCHYARD_NOT_HEALTHY",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "PERSISTENT_LEDGER",
    state: "OFFLINE",
    action: "REFUSE",
    reason: "LEDGER_UNAVAILABLE_NO_RECEIPT_ALLOWED",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: false
  },
  {
    module: "FRONTEND_SURFACE",
    state: "DEGRADED",
    action: "READ_ONLY",
    reason: "DISPLAY_ONLY_NO_ACTIONS",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "FUNDTRACKERAI",
    state: "DEGRADED",
    action: "SAFE_HOLD",
    reason: "TRANSACTION_MODULE_REVALIDATION_REQUIRED",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "LAWAIDAI",
    state: "DEGRADED",
    action: "SAFE_HOLD",
    reason: "RECEIVING_MODULE_REVALIDATION_REQUIRED",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  },
  {
    module: "LAIW",
    state: "DEGRADED",
    action: "SAFE_HOLD",
    reason: "ROUTE_MODULE_REVALIDATION_REQUIRED",
    canExecuteConsequence: false,
    canDisplayFrontend: true,
    canWriteLedger: true
  }
];
