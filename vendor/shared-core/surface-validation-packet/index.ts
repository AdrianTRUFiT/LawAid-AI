export type SurfaceValidationStatus =
  | "SURFACE_VALIDATION_PACKET_READY"
  | "SURFACE_VALIDATION_PACKET_BLOCKED";

export type UserCompletionSignal =
  | "completed_without_help"
  | "completed_with_minor_confusion"
  | "completed_with_major_confusion"
  | "abandoned"
  | "blocked_by_trust"
  | "blocked_by_language"
  | "blocked_by_flow";

export type TrustSignal =
  | "trusted"
  | "somewhat_trusted"
  | "unclear"
  | "distrusted";

export type Phase2Decision =
  | "expand_to_paid_beta"
  | "repair_surface_and_retest"
  | "refine_offer_and_channel"
  | "hold_phase_2";

export interface SurfaceValidationAuthority {
  readonly __brand: "SURFACE_VALIDATION_AUTHORITY";
  mayAuthorizeLaunch: true;
}

export interface ProcessorIntegrationAuthority {
  readonly __brand: "PROCESSOR_INTEGRATION_AUTHORITY";
  mayBeginProcessorWork: true;
}

export interface ReadOnlyValidationPacket {
  readonly __brand: "READ_ONLY_SURFACE_VALIDATION_PACKET";
  packetId: string;
  title: string;
  status: SurfaceValidationStatus;
  userCountTarget: 10;
  scope: {
    readOnlyDemo: true;
    oneNarrowWorkflow: true;
    noLiveRails: true;
    noPaymentProcessing: true;
    noLegalAdvice: true;
    noInternalStackExposure: true;
    noRuntimeActivation: true;
  };
  validatedSurfaces: {
    paiSafeUiStateMapping: true;
    surfaceContract: true;
    failureTaxonomy: true;
  };
  userPrompt: string;
  successCriteria: string[];
  failureCriteria: string[];
  phase2Gate: {
    processorSelectionBlocked: true;
    merchantAccountBlocked: true;
    pciScopeBlocked: true;
    launchMarketBlocked: true;
    phase2RequiresHumanDecision: true;
  };
  boundary: {
    packetIsNotPublicLaunch: true;
    packetCreatesNoPaymentAuthority: true;
    packetCreatesNoTransactionTruth: true;
    packetCreatesNoCustodyTransfer: true;
    packetCreatesNoRuntimeActivation: true;
    packetDoesNotAuthorizeProcessorWork: true;
  };
}

export interface UserValidationSignal {
  userId: string;
  completedWorkflow: boolean;
  completionSignal: UserCompletionSignal;
  trustSignal: TrustSignal;
  neededFounderExplanation: boolean;
  hesitationPoint?: string;
  exactUserWords?: string;
  timeToCompleteBand: "under_3_min" | "3_to_7_min" | "7_to_15_min" | "over_15_min" | "not_completed";
  valueUnderstood: boolean;
}

export interface ValidationSignalSummary {
  totalUsers: number;
  completedWithoutHelp: number;
  completedWithHelpOrConfusion: number;
  abandonedOrBlocked: number;
  trustedOrSomewhatTrusted: number;
  valueUnderstoodCount: number;
  recommendedPhase2Decision: Phase2Decision;
  reason: string;
  boundary: {
    summaryIsSignalOnly: true;
    summaryDoesNotAuthorizeLaunch: true;
    summaryDoesNotAuthorizeProcessorWork: true;
    humanDecisionStillRequired: true;
  };
}

export interface TenUserReadOnlyTestScript {
  readonly __brand: "TEN_USER_READ_ONLY_TEST_SCRIPT";
  scriptId: string;
  title: string;
  introLanguage: string;
  testerInstructions: string[];
  observerRules: string[];
  questions: string[];
  prohibitedClaims: string[];
  completionDefinition: string;
  boundary: {
    scriptIsReadOnly: true;
    scriptIsNotSalesPressure: true;
    scriptIsNotLegalAdvice: true;
    scriptUsesNoLiveRails: true;
    scriptCreatesNoAuthority: true;
  };
}

function countWhere<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function buildSurfaceValidationPacket(): ReadOnlyValidationPacket {
  return {
    __brand: "READ_ONLY_SURFACE_VALIDATION_PACKET",
    packetId: "surface_validation_packet_001",
    title: "Surface Validation Packet — LawAidAI Read-Only Demo Wedge",
    status: "SURFACE_VALIDATION_PACKET_READY",
    userCountTarget: 10,
    scope: {
      readOnlyDemo: true,
      oneNarrowWorkflow: true,
      noLiveRails: true,
      noPaymentProcessing: true,
      noLegalAdvice: true,
      noInternalStackExposure: true,
      noRuntimeActivation: true
    },
    validatedSurfaces: {
      paiSafeUiStateMapping: true,
      surfaceContract: true,
      failureTaxonomy: true
    },
    userPrompt:
      "Use this read-only LawAidAI demo to complete one guided organization workflow. Do not ask for explanation unless you are stuck. We are testing whether the surface makes sense on its own.",
    successCriteria: [
      "User completes the workflow without founder explanation.",
      "User understands the next step.",
      "User does not confuse display state with payment authority.",
      "User does not interpret the demo as legal advice.",
      "User can describe the value in their own words."
    ],
    failureCriteria: [
      "User cannot complete the workflow.",
      "User needs repeated founder explanation.",
      "User distrusts the surfaced state.",
      "User thinks PAI-SAFE processed payment.",
      "User thinks LawAidAI gave legal advice.",
      "User cannot explain what happened after completion."
    ],
    phase2Gate: {
      processorSelectionBlocked: true,
      merchantAccountBlocked: true,
      pciScopeBlocked: true,
      launchMarketBlocked: true,
      phase2RequiresHumanDecision: true
    },
    boundary: {
      packetIsNotPublicLaunch: true,
      packetCreatesNoPaymentAuthority: true,
      packetCreatesNoTransactionTruth: true,
      packetCreatesNoCustodyTransfer: true,
      packetCreatesNoRuntimeActivation: true,
      packetDoesNotAuthorizeProcessorWork: true
    }
  };
}

export function buildTenUserReadOnlyTestScript(): TenUserReadOnlyTestScript {
  return {
    __brand: "TEN_USER_READ_ONLY_TEST_SCRIPT",
    scriptId: "ten_user_read_only_test_script_001",
    title: "10-User Read-Only Surface Validation Script",
    introLanguage:
      "This is a read-only workflow demo. It is not legal advice, not a payment processor, and not a live transaction. Please move through the workflow as naturally as possible and say out loud where you hesitate.",
    testerInstructions: [
      "Give the user one narrow LawAidAI workflow.",
      "Do not explain the system unless the user gets stuck.",
      "Observe whether the user understands each step.",
      "Record the first moment of hesitation.",
      "Record whether the user understands the final output.",
      "Ask the user to explain what they think happened."
    ],
    observerRules: [
      "Do not sell.",
      "Do not coach unless the user is blocked.",
      "Do not mention internal architecture.",
      "Do not claim legal advice.",
      "Do not claim live payment processing.",
      "Do not imply Phase 2 has started."
    ],
    questions: [
      "What did you think this workflow helped you do?",
      "Where did you hesitate?",
      "Did any status language feel unclear?",
      "Did you trust the final output?",
      "Did you think this was legal advice?",
      "Did you think a real payment happened?",
      "Would you use this again for a similar problem?",
      "What would you expect the next step to be?"
    ],
    prohibitedClaims: [
      "This is a live launch.",
      "This processes your payment.",
      "This gives legal advice.",
      "This replaces an attorney.",
      "This verifies real transaction truth in production.",
      "This connects to live rails.",
      "This starts Phase 2 automatically."
    ],
    completionDefinition:
      "A user completes the test only if they finish the guided workflow, understand the output, and can explain the next step without founder explanation.",
    boundary: {
      scriptIsReadOnly: true,
      scriptIsNotSalesPressure: true,
      scriptIsNotLegalAdvice: true,
      scriptUsesNoLiveRails: true,
      scriptCreatesNoAuthority: true
    }
  };
}

export function summarizeValidationSignals(signals: UserValidationSignal[]): ValidationSignalSummary {
  const totalUsers = signals.length;
  const completedWithoutHelp = countWhere(
    signals,
    (signal) => signal.completedWorkflow && signal.completionSignal === "completed_without_help" && !signal.neededFounderExplanation
  );
  const completedWithHelpOrConfusion = countWhere(
    signals,
    (signal) =>
      signal.completedWorkflow &&
      (signal.neededFounderExplanation ||
        signal.completionSignal === "completed_with_minor_confusion" ||
        signal.completionSignal === "completed_with_major_confusion")
  );
  const abandonedOrBlocked = countWhere(
    signals,
    (signal) =>
      !signal.completedWorkflow ||
      signal.completionSignal === "abandoned" ||
      signal.completionSignal === "blocked_by_trust" ||
      signal.completionSignal === "blocked_by_language" ||
      signal.completionSignal === "blocked_by_flow"
  );
  const trustedOrSomewhatTrusted = countWhere(
    signals,
    (signal) => signal.trustSignal === "trusted" || signal.trustSignal === "somewhat_trusted"
  );
  const valueUnderstoodCount = countWhere(signals, (signal) => signal.valueUnderstood);

  let recommendedPhase2Decision: Phase2Decision = "hold_phase_2";
  let reason = "Insufficient signal. Continue controlled read-only validation.";

  if (totalUsers >= 10 && completedWithoutHelp >= 7 && trustedOrSomewhatTrusted >= 7 && valueUnderstoodCount >= 7) {
    recommendedPhase2Decision = "expand_to_paid_beta";
    reason = "Most users completed without help, trusted the surface, and understood the value.";
  } else if (totalUsers >= 10 && completedWithHelpOrConfusion + abandonedOrBlocked >= 5) {
    recommendedPhase2Decision = "repair_surface_and_retest";
    reason = "Surface friction is high. Repair workflow clarity before Phase 2.";
  } else if (totalUsers >= 10 && valueUnderstoodCount < 4) {
    recommendedPhase2Decision = "refine_offer_and_channel";
    reason = "Users did not understand the value. Refine offer and entry channel.";
  }

  return {
    totalUsers,
    completedWithoutHelp,
    completedWithHelpOrConfusion,
    abandonedOrBlocked,
    trustedOrSomewhatTrusted,
    valueUnderstoodCount,
    recommendedPhase2Decision,
    reason,
    boundary: {
      summaryIsSignalOnly: true,
      summaryDoesNotAuthorizeLaunch: true,
      summaryDoesNotAuthorizeProcessorWork: true,
      humanDecisionStillRequired: true
    }
  };
}

export function buildSurfaceValidationReadiness() {
  const packet = buildSurfaceValidationPacket();
  const script = buildTenUserReadOnlyTestScript();

  const ready =
    packet.status === "SURFACE_VALIDATION_PACKET_READY" &&
    packet.scope.readOnlyDemo === true &&
    packet.phase2Gate.processorSelectionBlocked === true &&
    script.boundary.scriptIsReadOnly === true &&
    script.boundary.scriptIsNotLegalAdvice === true;

  return {
    status: ready ? "SURFACE_VALIDATION_PACKET_READY" : "SURFACE_VALIDATION_PACKET_BLOCKED",
    packet,
    script,
    boundary: {
      readinessCreatesNoLaunch: true,
      readinessCreatesNoProcessorAuthorization: true,
      readinessCreatesNoPaymentAuthority: true,
      readinessCreatesNoRuntimeActivation: true
    }
  } as const;
}

export const SURFACE_VALIDATION_PACKET_DOCTRINE = {
  name: "Surface Validation Packet + 10-User Read-Only Test Script",
  class: "READ_ONLY_SURFACE_VALIDATION_GOVERNANCE_PACKET",
  purpose:
    "Package a controlled 10-user validation wedge that tests user comprehension and trust without launch, live rails, legal advice, or processor work.",
  boundary: {
    validationOnly: true,
    notLaunch: true,
    noLiveRails: true,
    noLegalAdvice: true,
    noProcessorWorkAuthorized: true,
    phase2RequiresHumanDecision: true
  }
} as const;
