export type GTISIntegrationStatus =
  | "FUNDTRACKER_GTIS_INTEGRATION_REQUEST_READY"
  | "FUNDTRACKER_GTIS_INTEGRATION_BLOCKED";

export type ReverificationRequestRoute =
  | "REFUSE"
  | "HOLD"
  | "REQUEST_FUNDTRACKER_REVERIFICATION"
  | "REQUEST_ATS_ARTIFACT_CHECK";

export type ActivatedTransactionStateGateStatus =
  | "ATS_ARTIFACT_VERIFIED"
  | "ATS_ARTIFACT_BLOCKED";

export type PaiSafeBindingStatus =
  | "display_not_started"
  | "display_pending"
  | "display_governed_safe"
  | "display_held"
  | "display_refused"
  | "display_activated"
  | "display_requires_attention";

export type OversightRoute =
  | "none"
  | "monitor"
  | "review"
  | "respond"
  | "escalate";

export type IntegrationRefusalCode =
  | "GTIS_REVIEW_PACKET_REQUIRED"
  | "GTIS_REVIEW_PACKET_NOT_READY"
  | "FUNDTRACKER_DECISION_REF_REQUIRED"
  | "VERIFIED_OPPORTUNITY_REF_REQUIRED"
  | "CONSEQUENCE_HANDOFF_REQUIRED"
  | "ACTIVE_REFUSAL_PRESENT"
  | "PROOF_HEALTH_NOT_CLEAN"
  | "HUMAN_ACCEPTANCE_REQUIRED"
  | "ATS_ARTIFACT_REQUIRED"
  | "ATS_ARTIFACT_MUST_BE_EMITTED_BY_FUNDTRACKER"
  | "GTIS_CANNOT_WRITE_FUNDTRACKER_STATE"
  | "PAI_SAFE_CANNOT_CREATE_TRUTH"
  | "FINTECHIONAI_CANNOT_AUTHORIZE"
  | "RUNTIME_ACTIVATION_NOT_CREATED_HERE";

export interface GTISReviewPacketSummary {
  status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY" | string;
  finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY" | string;
  scopedCompile: "PASS" | string;
  smoke: "PASS" | string;
  launchRequiresHumanAcceptance: boolean;
}

export interface FundTrackerReverificationRequestInput {
  transactionRef: string;
  verifiedOpportunityRef?: string;
  fundTrackerDecisionRef?: string;
  consequenceRoute:
    | "FUNDTRACKER_REVERIFY_HANDOFF"
    | "ACTIVATION_ELIGIBILITY_READY"
    | "HUMAN_REVIEW_REQUIRED"
    | "CONTINUE_HOLD"
    | "INSTANT_REFUSE";
  reviewReceiptRef?: string;
  proofHealthClean: boolean;
  activeRefusals: string[];
  gtisReviewPacket: GTISReviewPacketSummary;
  humanAcceptanceRecorded: boolean;
  attemptedWriteToFundTracker: boolean;
}

export interface FundTrackerReverificationRequest {
  requestId: string;
  transactionRef: string;
  status: GTISIntegrationStatus;
  route: ReverificationRequestRoute;
  readyToRequestFundTrackerReview: boolean;
  refusalReasons: IntegrationRefusalCode[];
  requiredCorrections: string[];
  references: {
    verifiedOpportunityRef?: string;
    fundTrackerDecisionRef?: string;
    reviewReceiptRef?: string;
  };
  requestSummary: string;
  boundary: {
    adapterIsReadAndRequestOnly: true;
    adapterDoesNotWriteFundTrackerState: true;
    adapterIsNotPaymentAuthority: true;
    adapterIsNotTransactionTruth: true;
    adapterIsNotCustodyTransfer: true;
    adapterIsNotRuntimeActivation: true;
    fundTrackerAIRemainsTransactionTruth: true;
    gtisSupportsButDoesNotReplaceFundTrackerAI: true;
  };
}

export interface ActivatedTransactionStateArtifactGateInput {
  transactionRef: string;
  actor: "FUNDTRACKER_AI" | "GTIS" | "PAI_SAFE" | "FINTECHION_AI" | "HUMAN_REVIEW";
  verifiedCommitment: boolean;
  verifiedOpportunityRef?: string;
  fundTrackerDecisionRef?: string;
  fundTrackerEmittedActivatedTransactionStateRef?: string;
  proofHealthClean: boolean;
  activeRefusals: string[];
}

export interface ActivatedTransactionStateArtifactGateDecision {
  gateId: string;
  transactionRef: string;
  status: ActivatedTransactionStateGateStatus;
  eligible: boolean;
  activatedTransactionStateRef?: string;
  refusalReasons: IntegrationRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    gateVerifiesArtifactOnly: true;
    gateDoesNotGenerateActivatedTransactionState: true;
    gateIsNotPaymentAuthority: true;
    gateIsNotTransactionTruth: true;
    gateIsNotCustodyTransfer: true;
    gateDoesNotCreateRuntimeActivation: true;
    onlyFundTrackerAIMayEmitATSArtifact: true;
  };
}

export interface PaiSafeDisplayBinding {
  bindingId: string;
  transactionRef: string;
  status: PaiSafeBindingStatus;
  consumerMessage: string;
  safeToDisplay: boolean;
  safeToProceed: boolean;
  downstreamActivationEligible: boolean;
  sourceRefs: {
    fundTrackerDecisionRef?: string;
    activatedTransactionStateRef?: string;
  };
  boundary: {
    paiSafeIsDisplayOnly: true;
    paiSafeDoesNotCreateTransactionTruth: true;
    paiSafeDoesNotCreatePaymentAuthority: true;
    paiSafeDoesNotCreateRuntimeActivation: true;
    displayIsNotAuthority: true;
  };
}

export interface FinTechionOversightFeed {
  feedId: string;
  transactionRef: string;
  route: OversightRoute;
  summary: string;
  signals: string[];
  boundary: {
    oversightIsReadOnly: true;
    oversightIsNotTransactionTruth: true;
    oversightDoesNotOverrideFundTrackerAI: true;
    oversightDoesNotCreateActivatedTransactionState: true;
    oversightDoesNotAuthorizeConsequence: true;
  };
}

export interface GTISDemoHarnessResult {
  harnessId: string;
  scenariosPassed: number;
  scenariosFailed: number;
  scenarioResults: Array<{
    scenarioId: string;
    label: string;
    passed: boolean;
    proof: string;
  }>;
  boundary: {
    demoIsNotProductionDeployment: true;
    demoCreatesNoPaymentAuthority: true;
    demoCreatesNoTransactionTruth: true;
    demoCreatesNoCustodyTransfer: true;
    demoCreatesNoRuntimeActivation: true;
    everyDemoClaimMustTraceToArtifact: true;
  };
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildFundTrackerReverificationRequest(
  input: FundTrackerReverificationRequestInput
): FundTrackerReverificationRequest {
  const refusalReasons: IntegrationRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (input.gtisReviewPacket.status !== "GTIS_LAUNCH_CANDIDATE_REVIEW_READY") {
    refusalReasons.push("GTIS_REVIEW_PACKET_NOT_READY");
    requiredCorrections.push("GTIS launch review packet must be ready.");
  }

  if (
    input.gtisReviewPacket.scopedCompile !== "PASS" ||
    input.gtisReviewPacket.smoke !== "PASS"
  ) {
    refusalReasons.push("GTIS_REVIEW_PACKET_REQUIRED");
    requiredCorrections.push("GTIS review packet must have scoped compile and smoke pass.");
  }

  if (input.attemptedWriteToFundTracker) {
    refusalReasons.push("GTIS_CANNOT_WRITE_FUNDTRACKER_STATE");
    requiredCorrections.push("GTIS may request FundTrackerAI reverification, but may not write FundTrackerAI state.");
  }

  if (!hasText(input.fundTrackerDecisionRef)) {
    refusalReasons.push("FUNDTRACKER_DECISION_REF_REQUIRED");
    requiredCorrections.push("Preserve FundTrackerAI decision reference.");
  }

  if (!hasText(input.verifiedOpportunityRef)) {
    refusalReasons.push("VERIFIED_OPPORTUNITY_REF_REQUIRED");
    requiredCorrections.push("Verified Opportunity reference is required before ATS eligibility.");
  }

  if (
    input.consequenceRoute !== "FUNDTRACKER_REVERIFY_HANDOFF" &&
    input.consequenceRoute !== "ACTIVATION_ELIGIBILITY_READY"
  ) {
    refusalReasons.push("CONSEQUENCE_HANDOFF_REQUIRED");
    requiredCorrections.push("Consequence Intelligence must route to FundTrackerAI reverify handoff or ATS artifact check.");
  }

  if (!input.proofHealthClean) {
    refusalReasons.push("PROOF_HEALTH_NOT_CLEAN");
    requiredCorrections.push("Proof health must be clean before FundTrackerAI review request.");
  }

  if (input.activeRefusals.length > 0) {
    refusalReasons.push("ACTIVE_REFUSAL_PRESENT");
    requiredCorrections.push("Resolve active refusals before FundTrackerAI review request.");
  }

  if (!input.humanAcceptanceRecorded) {
    refusalReasons.push("HUMAN_ACCEPTANCE_REQUIRED");
    requiredCorrections.push("Human acceptance is required before launch-candidate integration handoff.");
  }

  const ready = refusalReasons.length === 0;

  const route: ReverificationRequestRoute = ready
    ? input.consequenceRoute === "ACTIVATION_ELIGIBILITY_READY"
      ? "REQUEST_ATS_ARTIFACT_CHECK"
      : "REQUEST_FUNDTRACKER_REVERIFICATION"
    : refusalReasons.includes("ACTIVE_REFUSAL_PRESENT") || refusalReasons.includes("PROOF_HEALTH_NOT_CLEAN")
      ? "HOLD"
      : "REFUSE";

  return {
    requestId: `fundtracker_gtis_request_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    status: ready ? "FUNDTRACKER_GTIS_INTEGRATION_REQUEST_READY" : "FUNDTRACKER_GTIS_INTEGRATION_BLOCKED",
    route,
    readyToRequestFundTrackerReview: ready,
    refusalReasons: unique(refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    references: {
      ...(input.verifiedOpportunityRef ? { verifiedOpportunityRef: input.verifiedOpportunityRef } : {}),
      ...(input.fundTrackerDecisionRef ? { fundTrackerDecisionRef: input.fundTrackerDecisionRef } : {}),
      ...(input.reviewReceiptRef ? { reviewReceiptRef: input.reviewReceiptRef } : {})
    },
    requestSummary:
      "GTIS request is read-and-request only. FundTrackerAI must independently re-evaluate and decide.",
    boundary: {
      adapterIsReadAndRequestOnly: true,
      adapterDoesNotWriteFundTrackerState: true,
      adapterIsNotPaymentAuthority: true,
      adapterIsNotTransactionTruth: true,
      adapterIsNotCustodyTransfer: true,
      adapterIsNotRuntimeActivation: true,
      fundTrackerAIRemainsTransactionTruth: true,
      gtisSupportsButDoesNotReplaceFundTrackerAI: true
    }
  };
}

export function evaluateActivatedTransactionStateArtifactGate(
  input: ActivatedTransactionStateArtifactGateInput
): ActivatedTransactionStateArtifactGateDecision {
  const refusalReasons: IntegrationRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (input.actor !== "FUNDTRACKER_AI") {
    refusalReasons.push("ATS_ARTIFACT_MUST_BE_EMITTED_BY_FUNDTRACKER");
    requiredCorrections.push("Activated Transaction State artifact must be emitted by FundTrackerAI.");
  }

  if (!input.verifiedCommitment) {
    refusalReasons.push("FUNDTRACKER_DECISION_REF_REQUIRED");
    requiredCorrections.push("Verified commitment is required.");
  }

  if (!hasText(input.verifiedOpportunityRef)) {
    refusalReasons.push("VERIFIED_OPPORTUNITY_REF_REQUIRED");
    requiredCorrections.push("Verified Opportunity reference is required.");
  }

  if (!hasText(input.fundTrackerDecisionRef)) {
    refusalReasons.push("FUNDTRACKER_DECISION_REF_REQUIRED");
    requiredCorrections.push("FundTrackerAI decision reference is required.");
  }

  if (!hasText(input.fundTrackerEmittedActivatedTransactionStateRef)) {
    refusalReasons.push("ATS_ARTIFACT_REQUIRED");
    requiredCorrections.push("FundTrackerAI-emitted Activated Transaction State artifact reference is required.");
  }

  if (!input.proofHealthClean) {
    refusalReasons.push("PROOF_HEALTH_NOT_CLEAN");
    requiredCorrections.push("Proof health must be clean.");
  }

  if (input.activeRefusals.length > 0) {
    refusalReasons.push("ACTIVE_REFUSAL_PRESENT");
    requiredCorrections.push("Resolve active refusals before ATS artifact verification.");
  }

  const eligible = refusalReasons.length === 0;

  return {
    gateId: `ats_artifact_gate_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    status: eligible ? "ATS_ARTIFACT_VERIFIED" : "ATS_ARTIFACT_BLOCKED",
    eligible,
    ...(eligible && input.fundTrackerEmittedActivatedTransactionStateRef
      ? { activatedTransactionStateRef: input.fundTrackerEmittedActivatedTransactionStateRef }
      : {}),
    refusalReasons: unique(refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    boundary: {
      gateVerifiesArtifactOnly: true,
      gateDoesNotGenerateActivatedTransactionState: true,
      gateIsNotPaymentAuthority: true,
      gateIsNotTransactionTruth: true,
      gateIsNotCustodyTransfer: true,
      gateDoesNotCreateRuntimeActivation: true,
      onlyFundTrackerAIMayEmitATSArtifact: true
    }
  };
}

export function bindGTISToPaiSafeDisplay(
  request: FundTrackerReverificationRequest,
  atsGate: ActivatedTransactionStateArtifactGateDecision
): PaiSafeDisplayBinding {
  let status: PaiSafeBindingStatus = "display_requires_attention";
  let message = "PAI-SAFE requires attention: GTIS support state is not ready.";
  let safeToProceed = false;
  let downstreamActivationEligible = false;

  if (request.route === "HOLD") {
    status = "display_held";
    message = "PAI-SAFE hold: GTIS detected unresolved review or proof-health conditions.";
  } else if (request.route === "REFUSE") {
    status = "display_refused";
    message = "PAI-SAFE refused: GTIS integration request is blocked.";
  } else if (request.route === "REQUEST_FUNDTRACKER_REVERIFICATION") {
    status = "display_governed_safe";
    message = "PAI-SAFE governed: GTIS is ready to request FundTrackerAI reverification.";
    safeToProceed = true;
  } else if (request.route === "REQUEST_ATS_ARTIFACT_CHECK" && atsGate.eligible) {
    status = "display_activated";
    message = "PAI-SAFE activated display: FundTrackerAI-emitted ATS artifact was verified.";
    safeToProceed = true;
    downstreamActivationEligible = true;
  } else if (request.route === "REQUEST_ATS_ARTIFACT_CHECK" && !atsGate.eligible) {
    status = "display_pending";
    message = "PAI-SAFE pending: FundTrackerAI-emitted ATS artifact has not been verified.";
  }

  return {
    bindingId: `pai_safe_gtis_binding_${request.transactionRef}`,
    transactionRef: request.transactionRef,
    status,
    consumerMessage: message,
    safeToDisplay: true,
    safeToProceed,
    downstreamActivationEligible,
    sourceRefs: {
      ...(request.references.fundTrackerDecisionRef ? { fundTrackerDecisionRef: request.references.fundTrackerDecisionRef } : {}),
      ...(atsGate.activatedTransactionStateRef ? { activatedTransactionStateRef: atsGate.activatedTransactionStateRef } : {})
    },
    boundary: {
      paiSafeIsDisplayOnly: true,
      paiSafeDoesNotCreateTransactionTruth: true,
      paiSafeDoesNotCreatePaymentAuthority: true,
      paiSafeDoesNotCreateRuntimeActivation: true,
      displayIsNotAuthority: true
    }
  };
}

export function buildFinTechionOversightFeed(
  request: FundTrackerReverificationRequest,
  atsGate: ActivatedTransactionStateArtifactGateDecision,
  paiSafe: PaiSafeDisplayBinding
): FinTechionOversightFeed {
  const signals: string[] = [];

  if (request.refusalReasons.length > 0) signals.push(...request.refusalReasons);
  if (atsGate.refusalReasons.length > 0) signals.push(...atsGate.refusalReasons);
  signals.push(`PAI_SAFE_STATUS:${paiSafe.status}`);

  const route: OversightRoute =
    request.route === "REFUSE"
      ? "respond"
      : request.route === "HOLD"
        ? "review"
        : atsGate.status === "ATS_ARTIFACT_BLOCKED"
          ? "monitor"
          : "none";

  return {
    feedId: `fintechionai_gtis_feed_${request.transactionRef}`,
    transactionRef: request.transactionRef,
    route,
    summary:
      "FinTechionAI may observe GTIS and FundTrackerAI integration state, but cannot authorize transaction truth, ATS eligibility, or payment consequence.",
    signals: unique(signals),
    boundary: {
      oversightIsReadOnly: true,
      oversightIsNotTransactionTruth: true,
      oversightDoesNotOverrideFundTrackerAI: true,
      oversightDoesNotCreateActivatedTransactionState: true,
      oversightDoesNotAuthorizeConsequence: true
    }
  };
}

export function buildGTISDemoHarness(): GTISDemoHarnessResult {
  const reviewPacket: GTISReviewPacketSummary = {
    status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY",
    finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
    scopedCompile: "PASS",
    smoke: "PASS",
    launchRequiresHumanAcceptance: true
  };

  const processorOnly = buildFundTrackerReverificationRequest({
    transactionRef: "demo_processor_only",
    consequenceRoute: "HUMAN_REVIEW_REQUIRED",
    proofHealthClean: true,
    activeRefusals: [],
    gtisReviewPacket: reviewPacket,
    humanAcceptanceRecorded: true,
    attemptedWriteToFundTracker: false
  });

  const illegalWrite = buildFundTrackerReverificationRequest({
    transactionRef: "demo_illegal_write",
    verifiedOpportunityRef: "verified_opp_write",
    fundTrackerDecisionRef: "ft_decision_write",
    consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
    proofHealthClean: true,
    activeRefusals: [],
    gtisReviewPacket: reviewPacket,
    humanAcceptanceRecorded: true,
    attemptedWriteToFundTracker: true
  });

  const cleanRequest = buildFundTrackerReverificationRequest({
    transactionRef: "demo_clean",
    verifiedOpportunityRef: "verified_opp_001",
    fundTrackerDecisionRef: "ft_decision_001",
    consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
    reviewReceiptRef: "review_receipt_001",
    proofHealthClean: true,
    activeRefusals: [],
    gtisReviewPacket: reviewPacket,
    humanAcceptanceRecorded: true,
    attemptedWriteToFundTracker: false
  });

  const atsGate = evaluateActivatedTransactionStateArtifactGate({
    transactionRef: "demo_clean",
    actor: "FUNDTRACKER_AI",
    verifiedCommitment: true,
    verifiedOpportunityRef: "verified_opp_001",
    fundTrackerDecisionRef: "ft_decision_001",
    fundTrackerEmittedActivatedTransactionStateRef: "ats_fundtracker_emitted_001",
    proofHealthClean: true,
    activeRefusals: []
  });

  const paiSafe = bindGTISToPaiSafeDisplay(cleanRequest, atsGate);
  const oversight = buildFinTechionOversightFeed(cleanRequest, atsGate, paiSafe);

  const fakeAts = evaluateActivatedTransactionStateArtifactGate({
    transactionRef: "demo_fake_ats",
    actor: "GTIS",
    verifiedCommitment: true,
    verifiedOpportunityRef: "verified_opp_fake",
    fundTrackerDecisionRef: "ft_decision_fake",
    fundTrackerEmittedActivatedTransactionStateRef: "ats_fake_from_gtis",
    proofHealthClean: true,
    activeRefusals: []
  });

  const missingAts = evaluateActivatedTransactionStateArtifactGate({
    transactionRef: "demo_missing_ats",
    actor: "FUNDTRACKER_AI",
    verifiedCommitment: true,
    verifiedOpportunityRef: "verified_opp_missing",
    fundTrackerDecisionRef: "ft_decision_missing",
    proofHealthClean: true,
    activeRefusals: []
  });

  const scenarios = [
    {
      scenarioId: "scenario_001",
      label: "Processor success alone blocked from FundTrackerAI review request",
      passed: processorOnly.readyToRequestFundTrackerReview === false,
      proof: processorOnly.refusalReasons.join(",")
    },
    {
      scenarioId: "scenario_002",
      label: "GTIS attempted write into FundTrackerAI refused",
      passed:
        illegalWrite.readyToRequestFundTrackerReview === false &&
        illegalWrite.refusalReasons.includes("GTIS_CANNOT_WRITE_FUNDTRACKER_STATE"),
      proof: illegalWrite.refusalReasons.join(",")
    },
    {
      scenarioId: "scenario_003",
      label: "Clean GTIS request ready for FundTrackerAI reverification",
      passed: cleanRequest.readyToRequestFundTrackerReview === true,
      proof: cleanRequest.route
    },
    {
      scenarioId: "scenario_004",
      label: "ATS artifact must be emitted by FundTrackerAI",
      passed:
        fakeAts.eligible === false &&
        fakeAts.refusalReasons.includes("ATS_ARTIFACT_MUST_BE_EMITTED_BY_FUNDTRACKER"),
      proof: fakeAts.refusalReasons.join(",")
    },
    {
      scenarioId: "scenario_005",
      label: "ATS gate refuses missing FundTrackerAI-emitted ATS artifact",
      passed:
        missingAts.eligible === false &&
        missingAts.refusalReasons.includes("ATS_ARTIFACT_REQUIRED"),
      proof: missingAts.refusalReasons.join(",")
    },
    {
      scenarioId: "scenario_006",
      label: "PAI-SAFE display binding remains display only",
      passed:
        paiSafe.boundary.paiSafeDoesNotCreateTransactionTruth === true &&
        paiSafe.boundary.paiSafeDoesNotCreateRuntimeActivation === true,
      proof: paiSafe.status
    },
    {
      scenarioId: "scenario_007",
      label: "FinTechionAI oversight feed remains read-only",
      passed:
        oversight.boundary.oversightIsReadOnly === true &&
        oversight.boundary.oversightDoesNotCreateActivatedTransactionState === true,
      proof: oversight.route
    }
  ];

  return {
    harnessId: "gtis_demo_harness_revised_001",
    scenariosPassed: scenarios.filter((scenario) => scenario.passed).length,
    scenariosFailed: scenarios.filter((scenario) => !scenario.passed).length,
    scenarioResults: scenarios,
    boundary: {
      demoIsNotProductionDeployment: true,
      demoCreatesNoPaymentAuthority: true,
      demoCreatesNoTransactionTruth: true,
      demoCreatesNoCustodyTransfer: true,
      demoCreatesNoRuntimeActivation: true,
      everyDemoClaimMustTraceToArtifact: true
    }
  };
}
