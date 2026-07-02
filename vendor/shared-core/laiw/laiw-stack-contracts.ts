export type LAIWParticipantType =
  | "USER"
  | "VENDOR"
  | "BUYER"
  | "SELLER"
  | "API"
  | "CHECKPOINT"
  | "ROUTE_ARTIFACT"
  | "MOVEMENT";

export type LAIWStackIdentity = {
  id: string;
  label: string;
  soulId: string;
  soulmark: string;
  participantType: LAIWParticipantType;
  verified: boolean;
};

export type LAIWWorkflowStage =
  | "ORGANIZE"
  | "PLAN"
  | "PACKAGE"
  | "DROP_OFF"
  | "ACCEPT_1"
  | "PROCESS_1"
  | "STORE_1"
  | "RELEASE_1"
  | "TRANSPORT"
  | "ARRIVE"
  | "ACCEPT_2"
  | "PROCESS_2"
  | "RELEASE_2"
  | "STORE_2"
  | "RELEASE_3"
  | "DELIVER"
  | "ACCEPT_3"
  | "PROCESS_3"
  | "RECORD";

export const LAIW_WORKFLOW_CHAIN: LAIWWorkflowStage[] = [
  "ORGANIZE",
  "PLAN",
  "PACKAGE",
  "DROP_OFF",
  "ACCEPT_1",
  "PROCESS_1",
  "STORE_1",
  "RELEASE_1",
  "TRANSPORT",
  "ARRIVE",
  "ACCEPT_2",
  "PROCESS_2",
  "RELEASE_2",
  "STORE_2",
  "RELEASE_3",
  "DELIVER",
  "ACCEPT_3",
  "PROCESS_3",
  "RECORD"
];

export type LAIWConceptStack = {
  umbrella: "LAIW";
  umbrellaMeaning: "Logistical AI Workflow";
  dashboard: "LDB";
  dashboardMeaning: "Logistic DashBoard";
  search: "LSE";
  searchMeaning: "Logistics Search Engine";
  tracking: "VIT";
  trackingMeaning: "Verified Intelligent Tracking";
  adaptiveDashboardBase: "PAID";
  doctrine: {
    verificationNeedNotWant: true;
    openSearchAllowed: false;
    verifiedEcosystemRequired: true;
    roleAdaptiveDashboard: true;
    pointAToPointBCheckpointLogic: true;
  };
};

export const LAIW_CONCEPT_STACK: LAIWConceptStack = {
  umbrella: "LAIW",
  umbrellaMeaning: "Logistical AI Workflow",
  dashboard: "LDB",
  dashboardMeaning: "Logistic DashBoard",
  search: "LSE",
  searchMeaning: "Logistics Search Engine",
  tracking: "VIT",
  trackingMeaning: "Verified Intelligent Tracking",
  adaptiveDashboardBase: "PAID",
  doctrine: {
    verificationNeedNotWant: true,
    openSearchAllowed: false,
    verifiedEcosystemRequired: true,
    roleAdaptiveDashboard: true,
    pointAToPointBCheckpointLogic: true
  }
};
