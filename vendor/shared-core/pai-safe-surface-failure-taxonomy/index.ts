export type ProcessorTransportState =
  | "processor_not_started"
  | "processor_pending"
  | "processor_success"
  | "processor_failed"
  | "processor_duplicate"
  | "processor_partial"
  | "processor_race_detected"
  | "processor_timeout"
  | "processor_reversed";

export type FundTrackerVerificationState =
  | "fundtracker_not_started"
  | "fundtracker_pending"
  | "fundtracker_verified"
  | "fundtracker_held_for_review"
  | "fundtracker_refused"
  | "fundtracker_duplicate_detected"
  | "fundtracker_partial_payment_detected"
  | "fundtracker_race_condition_hold"
  | "fundtracker_stale_event_refused";

export type ActivatedTransactionArtifactState =
  | "ats_absent"
  | "ats_present"
  | "ats_invalid"
  | "ats_superseded"
  | "ats_duplicate_refused";

export type PaiSafeSurfaceDisplayStatus =
  | "not_started"
  | "processor_success_not_authority"
  | "verification_pending"
  | "governed_safe"
  | "held_for_review"
  | "duplicate_detected"
  | "partial_payment"
  | "race_condition_hold"
  | "refused"
  | "activated"
  | "requires_attention";

export type PaiSafeFailureClass =
  | "NONE"
  | "PROCESSOR_ONLY_SUCCESS"
  | "DUPLICATE_EVENT"
  | "PARTIAL_PAYMENT"
  | "RACE_CONDITION"
  | "STALE_EVENT"
  | "REFUSED_COMMITMENT"
  | "MISSING_FUNDTRACKER_DECISION"
  | "MISSING_ATS"
  | "INVALID_ATS"
  | "SUPERSEDED_ATS";

export interface TransactionTruthState {
  readonly __brand: "TRANSACTION_TRUTH_STATE";
  transactionRef: string;
  truthSource: "FundTrackerAI";
  fundTrackerDecisionRef: string;
  activatedTransactionStateRef?: string;
}

export interface PaiSafeSurfaceProjection {
  readonly __brand: "PAI_SAFE_SURFACE_PROJECTION";
  paiSafeId: string;
  transactionRef: string;
  status: PaiSafeSurfaceDisplayStatus;
  failureClass: PaiSafeFailureClass;
  consumerMessage: string;
  safeToDisplay: boolean;
  safeToProceed: boolean;
  downstreamActivationEligible: boolean;
  references: {
    processorEventRef?: string;
    fundTrackerDecisionRef?: string;
    activatedTransactionStateRef?: string;
  };
  visualDistinctions: {
    processorTransportVisible: boolean;
    fundTrackerVerificationVisible: boolean;
    activatedTransactionStateVisible: boolean;
    processorSuccessIsAuthority: false;
    fundTrackerIsTruthSource: true;
    displayIsAuthority: false;
  };
  boundary: {
    paiSafeIsProjectionOnly: true;
    paiSafeDoesNotProcessPayment: true;
    paiSafeDoesNotVerifyTruth: true;
    paiSafeDoesNotMutateTransactionState: true;
    paiSafeDoesNotCreateActivatedTransactionState: true;
    paiSafeDoesNotOverrideFundTrackerAI: true;
    paiSafeDoesNotCreateWalletBehavior: true;
    paiSafeDoesNotCreateAuthority: true;
  };
}

export interface PaiSafePressureInput {
  transactionRef: string;
  processorEventRef?: string;
  fundTrackerDecisionRef?: string;
  activatedTransactionStateRef?: string;
  processorTransportState: ProcessorTransportState;
  fundTrackerVerificationState: FundTrackerVerificationState;
  activatedTransactionArtifactState: ActivatedTransactionArtifactState;
}

export interface PaiSafePressureScenario {
  scenarioId: string;
  label: string;
  input: PaiSafePressureInput;
  expectedStatus: PaiSafeSurfaceDisplayStatus;
  expectedFailureClass: PaiSafeFailureClass;
  expectedSafeToProceed: boolean;
  expectedDownstreamActivationEligible: boolean;
}

export interface PaiSafePressureHarnessResult {
  harnessId: string;
  status: "PAI_SAFE_SURFACE_FAILURE_TAXONOMY_READY" | "PAI_SAFE_SURFACE_FAILURE_TAXONOMY_BLOCKED";
  scenariosPassed: number;
  scenariosFailed: number;
  scenarioResults: Array<{
    scenarioId: string;
    label: string;
    passed: boolean;
    expectedStatus: PaiSafeSurfaceDisplayStatus;
    actualStatus: PaiSafeSurfaceDisplayStatus;
    expectedFailureClass: PaiSafeFailureClass;
    actualFailureClass: PaiSafeFailureClass;
    proof: string;
  }>;
  boundary: {
    harnessCreatesNoPaymentAuthority: true;
    harnessCreatesNoTransactionTruth: true;
    harnessCreatesNoCustodyTransfer: true;
    harnessCreatesNoRuntimeActivation: true;
    harnessIsDisplayPressureOnly: true;
  };
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function buildPaiSafeSurfaceProjection(input: PaiSafePressureInput): PaiSafeSurfaceProjection {
  let status: PaiSafeSurfaceDisplayStatus = "requires_attention";
  let failureClass: PaiSafeFailureClass = "NONE";
  let consumerMessage = "PAI-SAFE requires attention before this transaction can be presented as governed.";
  let safeToProceed = false;
  let downstreamActivationEligible = false;

  const hasFundTrackerDecision = hasText(input.fundTrackerDecisionRef);
  const hasATS = hasText(input.activatedTransactionStateRef);

  if (
    input.processorTransportState === "processor_success" &&
    input.fundTrackerVerificationState === "fundtracker_not_started"
  ) {
    status = "processor_success_not_authority";
    failureClass = "PROCESSOR_ONLY_SUCCESS";
    consumerMessage = "Processor success is visible, but FundTrackerAI has not verified commitment yet.";
  } else if (
    input.fundTrackerVerificationState === "fundtracker_pending" ||
    input.processorTransportState === "processor_pending"
  ) {
    status = "verification_pending";
    failureClass = "NONE";
    consumerMessage = "Transaction verification is pending.";
  } else if (
    input.processorTransportState === "processor_duplicate" ||
    input.fundTrackerVerificationState === "fundtracker_duplicate_detected" ||
    input.activatedTransactionArtifactState === "ats_duplicate_refused"
  ) {
    status = "duplicate_detected";
    failureClass = "DUPLICATE_EVENT";
    consumerMessage = "Duplicate transaction activity was detected and requires governed handling.";
  } else if (
    input.processorTransportState === "processor_partial" ||
    input.fundTrackerVerificationState === "fundtracker_partial_payment_detected"
  ) {
    status = "partial_payment";
    failureClass = "PARTIAL_PAYMENT";
    consumerMessage = "Partial payment detected. Full governed commitment has not been verified.";
  } else if (
    input.processorTransportState === "processor_race_detected" ||
    input.fundTrackerVerificationState === "fundtracker_race_condition_hold"
  ) {
    status = "race_condition_hold";
    failureClass = "RACE_CONDITION";
    consumerMessage = "Race-condition pressure detected. Transaction is held for governed review.";
  } else if (input.fundTrackerVerificationState === "fundtracker_stale_event_refused") {
    status = "refused";
    failureClass = "STALE_EVENT";
    consumerMessage = "Stale transaction event refused.";
  } else if (input.fundTrackerVerificationState === "fundtracker_refused") {
    status = "refused";
    failureClass = "REFUSED_COMMITMENT";
    consumerMessage = "FundTrackerAI refused this transaction commitment.";
  } else if (input.activatedTransactionArtifactState === "ats_invalid") {
    status = "requires_attention";
    failureClass = "INVALID_ATS";
    consumerMessage = "Activated Transaction State reference is invalid.";
  } else if (input.activatedTransactionArtifactState === "ats_superseded") {
    status = "requires_attention";
    failureClass = "SUPERSEDED_ATS";
    consumerMessage = "Activated Transaction State has been superseded.";
  } else if (
    input.fundTrackerVerificationState === "fundtracker_verified" &&
    input.activatedTransactionArtifactState === "ats_absent"
  ) {
    status = "governed_safe";
    failureClass = hasFundTrackerDecision ? "MISSING_ATS" : "MISSING_FUNDTRACKER_DECISION";
    consumerMessage = "FundTrackerAI verified commitment. Downstream activation still requires Activated Transaction State.";
    safeToProceed = hasFundTrackerDecision;
  } else if (
    input.fundTrackerVerificationState === "fundtracker_verified" &&
    input.activatedTransactionArtifactState === "ats_present" &&
    hasFundTrackerDecision &&
    hasATS
  ) {
    status = "activated";
    failureClass = "NONE";
    consumerMessage = "FundTrackerAI verified commitment and Activated Transaction State is present.";
    safeToProceed = true;
    downstreamActivationEligible = true;
  } else if (input.fundTrackerVerificationState === "fundtracker_held_for_review") {
    status = "held_for_review";
    failureClass = "NONE";
    consumerMessage = "Transaction is held for FundTrackerAI-governed review.";
  }

  return {
    __brand: "PAI_SAFE_SURFACE_PROJECTION",
    paiSafeId: `pai_safe_surface_${input.transactionRef}`,
    transactionRef: input.transactionRef,
    status,
    failureClass,
    consumerMessage,
    safeToDisplay: true,
    safeToProceed,
    downstreamActivationEligible,
    references: {
      ...(input.processorEventRef ? { processorEventRef: input.processorEventRef } : {}),
      ...(input.fundTrackerDecisionRef ? { fundTrackerDecisionRef: input.fundTrackerDecisionRef } : {}),
      ...(input.activatedTransactionStateRef ? { activatedTransactionStateRef: input.activatedTransactionStateRef } : {})
    },
    visualDistinctions: {
      processorTransportVisible: hasText(input.processorEventRef),
      fundTrackerVerificationVisible: hasText(input.fundTrackerDecisionRef),
      activatedTransactionStateVisible: hasText(input.activatedTransactionStateRef),
      processorSuccessIsAuthority: false,
      fundTrackerIsTruthSource: true,
      displayIsAuthority: false
    },
    boundary: {
      paiSafeIsProjectionOnly: true,
      paiSafeDoesNotProcessPayment: true,
      paiSafeDoesNotVerifyTruth: true,
      paiSafeDoesNotMutateTransactionState: true,
      paiSafeDoesNotCreateActivatedTransactionState: true,
      paiSafeDoesNotOverrideFundTrackerAI: true,
      paiSafeDoesNotCreateWalletBehavior: true,
      paiSafeDoesNotCreateAuthority: true
    }
  };
}

export function getPaiSafePressureScenarios(): PaiSafePressureScenario[] {
  return [
    {
      scenarioId: "processor_success_only",
      label: "Processor success alone is displayed as non-authority",
      input: {
        transactionRef: "txn_processor_success_only",
        processorEventRef: "processor_evt_001",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_not_started",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "processor_success_not_authority",
      expectedFailureClass: "PROCESSOR_ONLY_SUCCESS",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "verification_pending",
      label: "Pending verification remains pending",
      input: {
        transactionRef: "txn_pending",
        processorEventRef: "processor_evt_002",
        processorTransportState: "processor_pending",
        fundTrackerVerificationState: "fundtracker_pending",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "verification_pending",
      expectedFailureClass: "NONE",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "duplicate_detected",
      label: "Duplicate activity surfaces duplicate display state",
      input: {
        transactionRef: "txn_duplicate",
        processorEventRef: "processor_evt_dup",
        fundTrackerDecisionRef: "ft_decision_dup",
        processorTransportState: "processor_duplicate",
        fundTrackerVerificationState: "fundtracker_duplicate_detected",
        activatedTransactionArtifactState: "ats_duplicate_refused"
      },
      expectedStatus: "duplicate_detected",
      expectedFailureClass: "DUPLICATE_EVENT",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "partial_payment",
      label: "Partial payment does not become governed safe",
      input: {
        transactionRef: "txn_partial",
        processorEventRef: "processor_evt_partial",
        fundTrackerDecisionRef: "ft_decision_partial",
        processorTransportState: "processor_partial",
        fundTrackerVerificationState: "fundtracker_partial_payment_detected",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "partial_payment",
      expectedFailureClass: "PARTIAL_PAYMENT",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "race_condition_hold",
      label: "Race condition pressure produces hold state",
      input: {
        transactionRef: "txn_race",
        processorEventRef: "processor_evt_race",
        fundTrackerDecisionRef: "ft_decision_race",
        processorTransportState: "processor_race_detected",
        fundTrackerVerificationState: "fundtracker_race_condition_hold",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "race_condition_hold",
      expectedFailureClass: "RACE_CONDITION",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "fundtracker_refused",
      label: "FundTrackerAI refusal surfaces refused state",
      input: {
        transactionRef: "txn_refused",
        processorEventRef: "processor_evt_refused",
        fundTrackerDecisionRef: "ft_decision_refused",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_refused",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "refused",
      expectedFailureClass: "REFUSED_COMMITMENT",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "verified_without_ats",
      label: "FundTrackerAI verified without ATS is governed safe but not downstream activation eligible",
      input: {
        transactionRef: "txn_verified_no_ats",
        processorEventRef: "processor_evt_verified",
        fundTrackerDecisionRef: "ft_decision_verified",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_verified",
        activatedTransactionArtifactState: "ats_absent"
      },
      expectedStatus: "governed_safe",
      expectedFailureClass: "MISSING_ATS",
      expectedSafeToProceed: true,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "activated",
      label: "ATS present after FundTrackerAI verification produces activated display",
      input: {
        transactionRef: "txn_activated",
        processorEventRef: "processor_evt_activated",
        fundTrackerDecisionRef: "ft_decision_activated",
        activatedTransactionStateRef: "ats_activated_001",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_verified",
        activatedTransactionArtifactState: "ats_present"
      },
      expectedStatus: "activated",
      expectedFailureClass: "NONE",
      expectedSafeToProceed: true,
      expectedDownstreamActivationEligible: true
    },
    {
      scenarioId: "invalid_ats",
      label: "Invalid ATS produces requires-attention display",
      input: {
        transactionRef: "txn_invalid_ats",
        processorEventRef: "processor_evt_invalid_ats",
        fundTrackerDecisionRef: "ft_decision_invalid_ats",
        activatedTransactionStateRef: "ats_invalid_001",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_verified",
        activatedTransactionArtifactState: "ats_invalid"
      },
      expectedStatus: "requires_attention",
      expectedFailureClass: "INVALID_ATS",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    },
    {
      scenarioId: "superseded_ats",
      label: "Superseded ATS produces requires-attention display",
      input: {
        transactionRef: "txn_superseded_ats",
        processorEventRef: "processor_evt_superseded",
        fundTrackerDecisionRef: "ft_decision_superseded",
        activatedTransactionStateRef: "ats_superseded_001",
        processorTransportState: "processor_success",
        fundTrackerVerificationState: "fundtracker_verified",
        activatedTransactionArtifactState: "ats_superseded"
      },
      expectedStatus: "requires_attention",
      expectedFailureClass: "SUPERSEDED_ATS",
      expectedSafeToProceed: false,
      expectedDownstreamActivationEligible: false
    }
  ];
}

export function runPaiSafePressureHarness(): PaiSafePressureHarnessResult {
  const scenarios = getPaiSafePressureScenarios();

  const scenarioResults = scenarios.map((scenario) => {
    const projection = buildPaiSafeSurfaceProjection(scenario.input);

    const passed =
      projection.status === scenario.expectedStatus &&
      projection.failureClass === scenario.expectedFailureClass &&
      projection.safeToProceed === scenario.expectedSafeToProceed &&
      projection.downstreamActivationEligible === scenario.expectedDownstreamActivationEligible &&
      projection.visualDistinctions.processorSuccessIsAuthority === false &&
      projection.visualDistinctions.fundTrackerIsTruthSource === true &&
      projection.visualDistinctions.displayIsAuthority === false &&
      projection.boundary.paiSafeDoesNotVerifyTruth === true &&
      projection.boundary.paiSafeDoesNotMutateTransactionState === true &&
      projection.boundary.paiSafeDoesNotCreateActivatedTransactionState === true;

    return {
      scenarioId: scenario.scenarioId,
      label: scenario.label,
      passed,
      expectedStatus: scenario.expectedStatus,
      actualStatus: projection.status,
      expectedFailureClass: scenario.expectedFailureClass,
      actualFailureClass: projection.failureClass,
      proof: projection.consumerMessage
    };
  });

  const scenariosPassed = scenarioResults.filter((scenario) => scenario.passed).length;
  const scenariosFailed = scenarioResults.filter((scenario) => !scenario.passed).length;

  return {
    harnessId: "pai_safe_surface_failure_taxonomy_harness_001",
    status:
      scenariosFailed === 0
        ? "PAI_SAFE_SURFACE_FAILURE_TAXONOMY_READY"
        : "PAI_SAFE_SURFACE_FAILURE_TAXONOMY_BLOCKED",
    scenariosPassed,
    scenariosFailed,
    scenarioResults,
    boundary: {
      harnessCreatesNoPaymentAuthority: true,
      harnessCreatesNoTransactionTruth: true,
      harnessCreatesNoCustodyTransfer: true,
      harnessCreatesNoRuntimeActivation: true,
      harnessIsDisplayPressureOnly: true
    }
  };
}

export const PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE = {
  name: "PAI-SAFE Surface Failure Taxonomy + Display-State Pressure Harness",
  class: "CONSUMER_SAFE_DISPLAY_PRESSURE_TAXONOMY",
  purpose:
    "Define display-safe edge-case states before the PAI-SAFE surface contract is written.",
  boundary: {
    paiSafeIsProjectionOnly: true,
    processorSuccessIsNotAuthority: true,
    fundTrackerAIRemainsTruthSource: true,
    activatedTransactionStateUnlocksDownstreamEligibility: true,
    displayIsNotAuthority: true
  }
} as const;
