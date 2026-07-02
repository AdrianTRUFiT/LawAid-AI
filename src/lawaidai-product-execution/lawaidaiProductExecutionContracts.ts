export type LawAidAIProductExecutionMode =
  | "LOCAL_LAUNCH_CANDIDATE"
  | "SIMULATED_UNTIL_FUNDTRACKERAI"
  | "DISPLAY_ONLY_UNTIL_ACTIVATED_TRANSACTION_STATE"
  | "CLIENT_SIDE_MANAGEMENT_ONLY";

export type LawAidAIUXDecision =
  | "KEEP"
  | "SIMPLIFY"
  | "HIDE"
  | "WIRE_LATER"
  | "REMOVE_CANDIDATE";

export type LawAidAIUXBoundary = {
  uiIsNotAuthority: true;
  activationDisplayIsNotActivatedTransactionState: true;
  paymentEventIsNotCommitmentTruth: true;
  fundTrackerAIVerifiesCommitment: true;
  lawAidAIUnlockRequiresActivatedTransactionState: true;
  legalEvidenceLanguageIsClientSideManagementOnly: true;
};

export type LawAidAILaunchSurface = {
  surfaceId: string;
  label: string;
  purpose: string;
  launchDecision: LawAidAIUXDecision;
  authorityBoundary: LawAidAIUXBoundary;
  visibleInLocalLaunch: boolean;
  notes: string[];
};

export type LawAidAIProductExecutionPolicy = {
  policyId: string;
  status: "LAWAIDAI_PRODUCT_EXECUTION_PASS_3_IMPLEMENTATION_READY";
  launchMode: "LOCAL_LAUNCH_CANDIDATE";
  commercialMode: "SIMULATED_UNTIL_FUNDTRACKERAI";
  activationMode: "DISPLAY_ONLY_UNTIL_ACTIVATED_TRANSACTION_STATE";
  evidenceMode: "CLIENT_SIDE_MANAGEMENT_ONLY";
  surfaces: LawAidAILaunchSurface[];
  blockedUntilLater: string[];
  boundary: LawAidAIUXBoundary & {
    policyIsNotRuntimeAuthority: true;
    policyIsNotPaymentTruth: true;
    policyIsNotActivation: true;
    policyDoesNotDeleteFiles: true;
  };
};
