export type FrontendSurfaceId =
  | "COMMAND_CENTER"
  | "PAID"
  | "LAWAIDAI_SHELL"
  | "FUNDTRACKERAI_SHELL"
  | "FINTECHIONAI_SHELL"
  | "LDB_SHELL"
  | "MOBILE_VIEW"
  | "OPERATOR_VIEW";

export type UserRole =
  | "operator"
  | "parent_admin"
  | "reviewer"
  | "client_user"
  | "vendor"
  | "buyer"
  | "seller"
  | "mobile_presence_user"
  | "external_viewer";

export type VisibilityState =
  | "visible"
  | "hidden"
  | "read_only"
  | "safe_hold"
  | "blocked";

export type FrontendSurface = {
  id: FrontendSurfaceId;
  label: string;
  surfaceRole: string;
  userRoles: UserRole[];
  allowedActions: string[];
  readSource: string;
  writePermissions: string[];
  backendDependencies: string[];
  visibilityState: VisibilityState;
  launchEligible: boolean;
};

export const FRONTEND_SURFACE_REGISTRY: FrontendSurface[] = [
  {
    id: "COMMAND_CENTER",
    label: "AIVA Command Center",
    surfaceRole: "operator_control_surface",
    userRoles: ["operator", "parent_admin"],
    allowedActions: ["view_backend_readiness", "view_environment_health", "review_queue", "trigger_allowed_actions"],
    readSource: "shared-core",
    writePermissions: ["operator_review_action"],
    backendDependencies: ["environment-registry", "operator-routing-layer", "launch-readiness"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "PAID",
    label: "PAID",
    surfaceRole: "adaptive_dashboard_inside_iAscendAi",
    userRoles: ["client_user", "buyer", "seller", "vendor"],
    allowedActions: ["view_allowed_state", "request_action", "drill_down_authorized"],
    readSource: "verified_backend_state",
    writePermissions: ["request_only"],
    backendDependencies: ["backend-view-contract", "permission-matrix"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "LAWAIDAI_SHELL",
    label: "LawAidAI Shell",
    surfaceRole: "bounded_receiving_domain_shell",
    userRoles: ["operator", "reviewer", "client_user"],
    allowedActions: ["view_live_record", "view_review_queue", "view_read_only_evidence_status"],
    readSource: "LawAidAI_district_packet",
    writePermissions: ["reviewer_action_only"],
    backendDependencies: ["receiving-bridge", "district-adapters", "app-side-bindings"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "FUNDTRACKERAI_SHELL",
    label: "FundTrackerAI Shell",
    surfaceRole: "transaction_truth_status_shell",
    userRoles: ["operator", "reviewer"],
    allowedActions: ["view_transaction_status", "view_hold_status", "view_activation_status"],
    readSource: "FundTrackerAI_verified_state",
    writePermissions: ["reviewer_action_only"],
    backendDependencies: ["fundtracker-bridge", "transaction-screening", "compliance-trust-layer"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "FINTECHIONAI_SHELL",
    label: "FinTechionAI Shell",
    surfaceRole: "operator_financial_oversight_shell",
    userRoles: ["operator", "parent_admin"],
    allowedActions: ["view_financial_oversight", "view_anomalies", "view_protected_flow_status"],
    readSource: "fintechionai-oversight-bridge",
    writePermissions: ["operator_annotation"],
    backendDependencies: ["fintechionai-oversight-bridge", "protected-flow-layer"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "LDB_SHELL",
    label: "LDB Shell",
    surfaceRole: "logistic_dashboard_surface",
    userRoles: ["operator", "buyer", "seller", "vendor"],
    allowedActions: ["view_route_artifact", "view_vit_trace", "view_tour_status"],
    readSource: "laiw_route_artifact_state",
    writePermissions: ["request_route_only"],
    backendDependencies: ["laiw", "laiw-tour-gate"],
    visibilityState: "visible",
    launchEligible: true
  },
  {
    id: "MOBILE_VIEW",
    label: "Mobile View",
    surfaceRole: "presence_surface",
    userRoles: ["mobile_presence_user", "client_user"],
    allowedActions: ["view_safe_status", "receive_alerts", "limited_review"],
    readSource: "cloud_safe_state",
    writePermissions: ["cache_only"],
    backendDependencies: ["environment-registry", "permission-matrix"],
    visibilityState: "read_only",
    launchEligible: false
  },
  {
    id: "OPERATOR_VIEW",
    label: "Operator View",
    surfaceRole: "internal_operator_visibility_surface",
    userRoles: ["operator", "parent_admin"],
    allowedActions: ["view_all_allowed_backend_state", "view_blockers", "view_warnings"],
    readSource: "launch_readiness_state",
    writePermissions: ["operator_review_action"],
    backendDependencies: ["environment-registry", "launch-readiness", "operator-routing-layer"],
    visibilityState: "visible",
    launchEligible: true
  }
];
