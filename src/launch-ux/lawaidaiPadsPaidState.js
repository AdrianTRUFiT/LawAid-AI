export function createLawAidAIPadsPaidState() {
  return {
    product: "LawAidAI",
    launchPath: "consumer_legal_workspace",
    pads: {
      meaning: "Pre-Authored Dashboard Setup",
      status: "base_workspace_ready",
      intelligence: false,
      inhabited: false,
      authority: false
    },
    identityLayer: {
      soulSeedStatus: "initialized_mock",
      identityReference: "SOULSEED-MOCK-LAWAIDAI-USER-001",
      inhabitantState: "present",
      intentState: "legal_continuity_and_position_management",
      homebaseCustody: "mock_local_continuity_ready",
      aiMindSetProfile: "Legal Clarity MindSet"
    },
    paid: {
      meaning: "Personal Adaptive Intelligent Dashboard",
      status: "inhabited_control_surface",
      livesInside: "iAscendAi",
      authority: false,
      workflowLaw: false,
      intelligenceItself: false
    },
    boundaries: {
      lawaidaiIsLawyer: false,
      lawaidaiIsLegalAuthority: false,
      paidIsAuthority: false,
      dashboardCreatesTruth: false,
      fundTrackerRemainsTransactionTruth: true,
      rateRemainsWorkflowLaw: true
    },
    copy: {
      headline: "Your legal workspace begins as PADS.",
      subhead: "It becomes PAID when your identity, matter state, documents, proof posture, and intent inhabit the workspace.",
      line: "Everyone gets PADS before they get PAID."
    },
    mockOnly: true
  };
}

export function verifyLawAidAIPadsPaidState(state) {
  const accepted =
    state.product === "LawAidAI" &&
    state.pads.status === "base_workspace_ready" &&
    state.identityLayer.soulSeedStatus === "initialized_mock" &&
    state.identityLayer.inhabitantState === "present" &&
    state.paid.status === "inhabited_control_surface" &&
    state.paid.livesInside === "iAscendAi" &&
    state.boundaries.paidIsAuthority === false &&
    state.boundaries.dashboardCreatesTruth === false &&
    state.boundaries.fundTrackerRemainsTransactionTruth === true &&
    state.boundaries.rateRemainsWorkflowLaw === true &&
    state.mockOnly === true;

  return {
    accepted,
    checks: {
      LAWAIDAI_PATH_READY: state.product === "LawAidAI",
      PADS_BASE_READY: state.pads.status === "base_workspace_ready",
      SOULSEED_INITIALIZED: state.identityLayer.soulSeedStatus === "initialized_mock",
      IDENTITY_PRESENT: state.identityLayer.inhabitantState === "present",
      PAID_INHABITED: state.paid.status === "inhabited_control_surface",
      PAID_INSIDE_IASCENDAI: state.paid.livesInside === "iAscendAi",
      PAID_NOT_AUTHORITY: state.boundaries.paidIsAuthority === false,
      DASHBOARD_NOT_TRUTH: state.boundaries.dashboardCreatesTruth === false,
      FUNDTRACKER_TRUTH_PRESERVED: state.boundaries.fundTrackerRemainsTransactionTruth === true,
      RATE_LAW_PRESERVED: state.boundaries.rateRemainsWorkflowLaw === true,
      MOCK_ONLY: state.mockOnly === true
    }
  };
}