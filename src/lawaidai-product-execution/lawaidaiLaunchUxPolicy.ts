import {
  LawAidAIProductExecutionPolicy,
  LawAidAIUXBoundary
} from "./lawaidaiProductExecutionContracts";

export const lawaidaiUXBoundary: LawAidAIUXBoundary = {
  uiIsNotAuthority: true,
  activationDisplayIsNotActivatedTransactionState: true,
  paymentEventIsNotCommitmentTruth: true,
  fundTrackerAIVerifiesCommitment: true,
  lawAidAIUnlockRequiresActivatedTransactionState: true,
  legalEvidenceLanguageIsClientSideManagementOnly: true
};

export const lawaidaiProductExecutionPolicy: LawAidAIProductExecutionPolicy = {
  policyId: "lawaidai-product-execution-pass-3",
  status: "LAWAIDAI_PRODUCT_EXECUTION_PASS_3_IMPLEMENTATION_READY",
  launchMode: "LOCAL_LAUNCH_CANDIDATE",
  commercialMode: "SIMULATED_UNTIL_FUNDTRACKERAI",
  activationMode: "DISPLAY_ONLY_UNTIL_ACTIVATED_TRANSACTION_STATE",
  evidenceMode: "CLIENT_SIDE_MANAGEMENT_ONLY",
  surfaces: [
    {
      surfaceId: "entry-dashboard",
      label: "Entry / Dashboard Surface",
      purpose: "Orient the user to the current LawAidAI workspace without overstating authority.",
      launchDecision: "KEEP",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Dashboard visibility is not authority.",
        "Use plain language around local launch candidate status."
      ]
    },
    {
      surfaceId: "workspace-case-packet",
      label: "Workspace / Case Packet Surface",
      purpose: "Preserve the primary user work area and packet context.",
      launchDecision: "KEEP",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Workspace organizes user-controlled material.",
        "Workspace does not certify evidence or provide legal authority."
      ]
    },
    {
      surfaceId: "activation-status",
      label: "Activation Status Surface",
      purpose: "Show local activation state without treating display as activation truth.",
      launchDecision: "SIMPLIFY",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Activation display is not Activated Transaction State.",
        "Production unlock requires FundTrackerAI verified commitment."
      ]
    },
    {
      surfaceId: "export-readiness",
      label: "Export Readiness Surface",
      purpose: "Show whether product output is locally ready for export.",
      launchDecision: "KEEP",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Export readiness is product output readiness only.",
        "Export does not create evidence, action, or legal certification."
      ]
    },
    {
      surfaceId: "product-output-confirmation",
      label: "Product Output Confirmation Surface",
      purpose: "Confirm that local product output was generated.",
      launchDecision: "KEEP",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Product output confirmation is not authority.",
        "Output confirmation does not equal legal validity."
      ]
    },
    {
      surfaceId: "ledger-record-visibility",
      label: "Ledger / Record Visibility Surface",
      purpose: "Show local ledger and record visibility while preserving non-authority boundaries.",
      launchDecision: "KEEP",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: true,
      notes: [
        "Ledger visibility is not transaction truth.",
        "FundTrackerAI is required for verified commitment."
      ]
    },
    {
      surfaceId: "payment-revenue-surfaces",
      label: "Payment / Revenue Surfaces",
      purpose: "Preserve but label as simulated until FundTrackerAI integration exists.",
      launchDecision: "WIRE_LATER",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: false,
      notes: [
        "Payment event is not commitment truth.",
        "Processor transport is not transaction authority.",
        "Do not expose as production payment path yet."
      ]
    },
    {
      surfaceId: "placeholder-demo-surfaces",
      label: "Placeholder / Demo Surfaces",
      purpose: "Hide unfinished placeholder surfaces from launch-facing UX.",
      launchDecision: "HIDE",
      authorityBoundary: lawaidaiUXBoundary,
      visibleInLocalLaunch: false,
      notes: [
        "Hide demo/placeholder language unless needed for internal testing.",
        "Do not delete without human review."
      ]
    }
  ],
  blockedUntilLater: [
    "Real payment processor event",
    "FundTrackerAI commitment verification",
    "Activated Transaction State",
    "Production unlock/output authority"
  ],
  boundary: {
    ...lawaidaiUXBoundary,
    policyIsNotRuntimeAuthority: true,
    policyIsNotPaymentTruth: true,
    policyIsNotActivation: true,
    policyDoesNotDeleteFiles: true
  }
};

export function getLawAidAILaunchSurfaces() {
  return lawaidaiProductExecutionPolicy.surfaces;
}

export function getVisibleLawAidAILaunchSurfaces() {
  return lawaidaiProductExecutionPolicy.surfaces.filter(
    (surface) => surface.visibleInLocalLaunch
  );
}

export function getWireLaterLawAidAISurfaces() {
  return lawaidaiProductExecutionPolicy.surfaces.filter(
    (surface) => surface.launchDecision === "WIRE_LATER"
  );
}

export function getHiddenLawAidAISurfaces() {
  return lawaidaiProductExecutionPolicy.surfaces.filter(
    (surface) => surface.launchDecision === "HIDE"
  );
}
