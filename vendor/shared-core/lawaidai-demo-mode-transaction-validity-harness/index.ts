export type DemoModeStatus =
  | "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_READY"
  | "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_BLOCKED"
  | "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_REFUSED";

export type DemoTransactionStage =
  | "RAW_SIGNAL"
  | "DICE_CAPTURED_SIGNAL"
  | "AIOP_VERIFIED_OPPORTUNITY"
  | "DEMO_AUTH_EVENT"
  | "FUNDTRACKERAI_DEMO_VALIDITY_DECISION"
  | "DEMO_ACTIVATED_TRANSACTION_STATE"
  | "LAWAIDAI_DEMO_UNLOCK";

export type DemoValidityDecision =
  | "VALID_FOR_DEMO_ACTIVATION"
  | "HELD_FOR_DEMO_REVIEW"
  | "REFUSED_FOR_DEMO_ACTIVATION";

export type DemoUnlockState =
  | "DEMO_OUTPUT_UNLOCKED"
  | "DEMO_OUTPUT_HELD"
  | "DEMO_OUTPUT_REFUSED";

export type DemoRefusalCode =
  | "DEMO_MODE_NOT_ENABLED"
  | "INVALID_DEMO_CARD_SIGNAL"
  | "REAL_PAYMENT_ATTEMPT_REFUSED"
  | "LIVE_RAIL_ATTEMPT_REFUSED"
  | "CAPTURE_ATTEMPT_REFUSED"
  | "SETTLEMENT_ATTEMPT_REFUSED"
  | "MISSING_RAW_SIGNAL"
  | "MISSING_DICE_CAPTURED_SIGNAL"
  | "MISSING_AIOP_VERIFIED_OPPORTUNITY"
  | "MISSING_COMMITMENT_TERMS"
  | "MISSING_POLICY_ACKNOWLEDGEMENT"
  | "MISSING_DEMO_AUTH_EVENT"
  | "LEGAL_AUTHORITY_CLAIM_REFUSED"
  | "FINANCIAL_AUTHORITY_CLAIM_REFUSED"
  | "LIVE_ATS_ATTEMPT_REFUSED";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface LiveActivatedTransactionStateAuthority {
  readonly __brand: "LIVE_ATS_AUTHORITY";
  mayCreateLiveATS: true;
}

export interface LegalAuthority {
  readonly __brand: "LEGAL_AUTHORITY";
  mayCreateLegalAuthority: true;
}

export interface FinancialAuthority {
  readonly __brand: "FINANCIAL_AUTHORITY";
  mayCreateFinancialAuthority: true;
}

export interface PublicLaunchAuthority {
  readonly __brand: "PUBLIC_LAUNCH_AUTHORITY";
  mayLaunchPublicly: true;
}

export interface DemoModeInput {
  demoMode: true;
  demoCardSignal: "4242";
  serviceRequest: string;
  userIntent: string;
  selectedService: string;
  commitmentTermsAccepted: boolean;
  policyAcknowledged: boolean;
  attemptsRealPayment?: boolean;
  attemptsLiveRail?: boolean;
  attemptsCapture?: boolean;
  attemptsSettlement?: boolean;
  attemptsLiveATS?: boolean;
  attemptsLegalAuthorityClaim?: boolean;
  attemptsFinancialAuthorityClaim?: boolean;
}

export interface RawSignal {
  readonly __brand: "RAW_SIGNAL";
  rawSignalId: string;
  serviceRequest: string;
  userIntent: string;
  createdAt: string;
}

export interface DiceCapturedSignal {
  readonly __brand: "DICE_CAPTURED_SIGNAL";
  capturedSignalId: string;
  rawSignalId: string;
  identityCaptured: true;
  intentCaptured: true;
  selectedService: string;
  createdAt: string;
}

export interface AiopVerifiedOpportunity {
  readonly __brand: "AIOP_VERIFIED_OPPORTUNITY";
  verifiedOpportunityId: string;
  capturedSignalId: string;
  commitmentTermsAccepted: true;
  policyAcknowledged: true;
  createdAt: string;
}

export interface DemoAuthorizationEvent {
  readonly __brand: "DEMO_AUTHORIZATION_EVENT";
  authorizationId: string;
  demoCardSignal: "4242";
  authorizationSuccess: true;
  mode: "demo";
  capture: "not_executed";
  settlement: "not_executed";
  authority: "none";
  createdAt: string;
  boundary: {
    authEventIsDemoOnly: true;
    authEventIsNotPaymentTruth: true;
    authEventCreatesNoFundsCapture: true;
    authEventCreatesNoSettlement: true;
    authEventCreatesNoFinancialAuthority: true;
  };
}

export interface FundTrackerAIDemoValidityDecision {
  readonly __brand: "FUNDTRACKERAI_DEMO_VALIDITY_DECISION";
  decisionId: string;
  verifiedOpportunityId: string;
  authorizationId: string;
  decision: DemoValidityDecision;
  reasons: string[];
  createdAt: string;
  boundary: {
    fundTrackerAIEvaluatesDemoValidityOnly: true;
    decisionCreatesNoLivePayment: true;
    decisionCreatesNoSettlement: true;
    decisionCreatesNoLiveATS: true;
    decisionCreatesNoLegalAuthority: true;
    decisionCreatesNoFinancialAuthority: true;
  };
}

export interface DemoActivatedTransactionState {
  readonly __brand: "DEMO_ACTIVATED_TRANSACTION_STATE";
  transactionId: string;
  demoAtsId: string;
  authId: string;
  validity: "verified";
  mode: "demo";
  capture: "not_executed";
  settlement: "not_executed";
  authority: "none";
  fundTrackerDecisionId: string;
  verifiedOpportunityId: string;
  createdAt: string;
  boundary: {
    demoAtsOnly: true;
    notLiveATS: true;
    createsNoLiveTransactionTruth: true;
    createsNoPaymentProcessing: true;
    createsNoFundsCapture: true;
    createsNoSettlement: true;
    createsNoCustodyTransfer: true;
    createsNoRuntimeActivation: true;
    createsNoLegalAuthority: true;
    createsNoFinancialAuthority: true;
  };
}

export interface LawAidAIDemoUnlock {
  readonly __brand: "LAWAIDAI_DEMO_UNLOCK";
  unlockId: string;
  transactionId: string;
  demoAtsId: string;
  unlockState: DemoUnlockState;
  unlockedOutputs: Array<"demo_confirmation_panel" | "demo_export_preview" | "demo_product_output_preview">;
  consumerMessage: string;
  createdAt: string;
  boundary: {
    unlockIsDemoOnly: true;
    unlockIsNotFinancialCompletion: true;
    unlockCreatesNoLegalAuthority: true;
    unlockCreatesNoFinancialAuthority: true;
    unlockCreatesNoRuntimeActivation: true;
    displayIsNotAuthority: true;
  };
}

export interface LawAidAIDemoRunRecord {
  readonly __brand: "LAWAIDAI_DEMO_RUN_RECORD";
  runId: string;
  status: DemoModeStatus;
  stage: DemoTransactionStage;
  rawSignal?: RawSignal;
  diceCapturedSignal?: DiceCapturedSignal;
  aiopVerifiedOpportunity?: AiopVerifiedOpportunity;
  demoAuthorizationEvent?: DemoAuthorizationEvent;
  fundTrackerDecision?: FundTrackerAIDemoValidityDecision;
  demoActivatedTransactionState?: DemoActivatedTransactionState;
  lawAidAIDemoUnlock?: LawAidAIDemoUnlock;
  refusalCodes: DemoRefusalCode[];
  approvedDemoLanguage: string[];
  prohibitedDemoLanguage: string[];
  boundary: {
    demoOnly: true;
    noLiveRailsCreated: true;
    noLivePaymentProcessingCreated: true;
    noFundsCaptured: true;
    noSettlementCreated: true;
    noLiveTransactionTruthCreated: true;
    noLiveATSCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
    noLegalAuthorityCreated: true;
    noFinancialAuthorityCreated: true;
    notPublicLaunchApproval: true;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function now(): string {
  return new Date().toISOString();
}

function boundary(): LawAidAIDemoRunRecord["boundary"] {
  return {
    demoOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noFundsCaptured: true,
    noSettlementCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalAuthorityCreated: true,
    noFinancialAuthorityCreated: true,
    notPublicLaunchApproval: true
  };
}

export function buildApprovedDemoLanguage(): string[] {
  return [
    "This demo shows how a transaction can be validated before money is captured.",
    "Payment rails are simulated. The focus is the validity decision.",
    "This demonstrates pre-capture verification logic, not payment processing.",
    "The 4242 card is used only as a demo authorization signal.",
    "FundTrackerAI evaluates demo validity before demo output unlock.",
    "LawAidAI unlocks demo output only after demo validity is confirmed."
  ];
}

export function buildProhibitedDemoLanguage(): string[] {
  return [
    "This processes live payments.",
    "This captures funds.",
    "This settles money.",
    "This creates financial authority.",
    "This creates legal authority.",
    "This creates live Activated Transaction State.",
    "This connects to live rails.",
    "This is public launch approval.",
    "The 4242 signal is payment truth."
  ];
}

export function validateDemoModeInput(input: DemoModeInput): DemoRefusalCode[] {
  const refusals: DemoRefusalCode[] = [];

  if (input.demoMode !== true) refusals.push("DEMO_MODE_NOT_ENABLED");
  if (input.demoCardSignal !== "4242") refusals.push("INVALID_DEMO_CARD_SIGNAL");

  if (!input.serviceRequest || input.serviceRequest.trim().length === 0) refusals.push("MISSING_RAW_SIGNAL");
  if (!input.userIntent || input.userIntent.trim().length === 0) refusals.push("MISSING_RAW_SIGNAL");
  if (!input.selectedService || input.selectedService.trim().length === 0) refusals.push("MISSING_DICE_CAPTURED_SIGNAL");

  if (input.commitmentTermsAccepted !== true) refusals.push("MISSING_COMMITMENT_TERMS");
  if (input.policyAcknowledged !== true) refusals.push("MISSING_POLICY_ACKNOWLEDGEMENT");

  if (input.attemptsRealPayment === true) refusals.push("REAL_PAYMENT_ATTEMPT_REFUSED");
  if (input.attemptsLiveRail === true) refusals.push("LIVE_RAIL_ATTEMPT_REFUSED");
  if (input.attemptsCapture === true) refusals.push("CAPTURE_ATTEMPT_REFUSED");
  if (input.attemptsSettlement === true) refusals.push("SETTLEMENT_ATTEMPT_REFUSED");
  if (input.attemptsLiveATS === true) refusals.push("LIVE_ATS_ATTEMPT_REFUSED");
  if (input.attemptsLegalAuthorityClaim === true) refusals.push("LEGAL_AUTHORITY_CLAIM_REFUSED");
  if (input.attemptsFinancialAuthorityClaim === true) refusals.push("FINANCIAL_AUTHORITY_CLAIM_REFUSED");

  return unique(refusals);
}

export function createRawSignal(input: DemoModeInput): RawSignal {
  return {
    __brand: "RAW_SIGNAL",
    rawSignalId: "raw_signal_demo_001",
    serviceRequest: input.serviceRequest,
    userIntent: input.userIntent,
    createdAt: now()
  };
}

export function createDiceCapturedSignal(rawSignal: RawSignal, input: DemoModeInput): DiceCapturedSignal {
  return {
    __brand: "DICE_CAPTURED_SIGNAL",
    capturedSignalId: "dice_captured_signal_demo_001",
    rawSignalId: rawSignal.rawSignalId,
    identityCaptured: true,
    intentCaptured: true,
    selectedService: input.selectedService,
    createdAt: now()
  };
}

export function createAiopVerifiedOpportunity(
  capturedSignal: DiceCapturedSignal,
  input: DemoModeInput
): AiopVerifiedOpportunity {
  if (input.commitmentTermsAccepted !== true || input.policyAcknowledged !== true) {
    throw new Error("AIOP_DEMO_VERIFIED_OPPORTUNITY_REQUIRES_COMMITMENT_AND_POLICY");
  }

  return {
    __brand: "AIOP_VERIFIED_OPPORTUNITY",
    verifiedOpportunityId: "aiop_verified_opportunity_demo_001",
    capturedSignalId: capturedSignal.capturedSignalId,
    commitmentTermsAccepted: true,
    policyAcknowledged: true,
    createdAt: now()
  };
}

export function simulateDemo4242Authorization(input: DemoModeInput): DemoAuthorizationEvent {
  if (input.demoCardSignal !== "4242") {
    throw new Error("DEMO_AUTH_REQUIRES_4242_SIGNAL");
  }

  return {
    __brand: "DEMO_AUTHORIZATION_EVENT",
    authorizationId: "demo_auth_001",
    demoCardSignal: "4242",
    authorizationSuccess: true,
    mode: "demo",
    capture: "not_executed",
    settlement: "not_executed",
    authority: "none",
    createdAt: now(),
    boundary: {
      authEventIsDemoOnly: true,
      authEventIsNotPaymentTruth: true,
      authEventCreatesNoFundsCapture: true,
      authEventCreatesNoSettlement: true,
      authEventCreatesNoFinancialAuthority: true
    }
  };
}

export function evaluateFundTrackerAIDemoValidity(
  verifiedOpportunity: AiopVerifiedOpportunity,
  authEvent: DemoAuthorizationEvent
): FundTrackerAIDemoValidityDecision {
  const valid =
    verifiedOpportunity.commitmentTermsAccepted === true &&
    verifiedOpportunity.policyAcknowledged === true &&
    authEvent.authorizationSuccess === true &&
    authEvent.mode === "demo" &&
    authEvent.capture === "not_executed" &&
    authEvent.settlement === "not_executed" &&
    authEvent.authority === "none";

  return {
    __brand: "FUNDTRACKERAI_DEMO_VALIDITY_DECISION",
    decisionId: "fundtrackerai_demo_validity_decision_001",
    verifiedOpportunityId: verifiedOpportunity.verifiedOpportunityId,
    authorizationId: authEvent.authorizationId,
    decision: valid ? "VALID_FOR_DEMO_ACTIVATION" : "REFUSED_FOR_DEMO_ACTIVATION",
    reasons: valid
      ? [
          "identity_present",
          "intent_captured",
          "commitment_terms_accepted",
          "policy_acknowledged",
          "demo_authorization_received",
          "capture_not_executed",
          "settlement_not_executed",
          "authority_none"
        ]
      : ["demo_validity_conditions_not_met"],
    createdAt: now(),
    boundary: {
      fundTrackerAIEvaluatesDemoValidityOnly: true,
      decisionCreatesNoLivePayment: true,
      decisionCreatesNoSettlement: true,
      decisionCreatesNoLiveATS: true,
      decisionCreatesNoLegalAuthority: true,
      decisionCreatesNoFinancialAuthority: true
    }
  };
}

export function createDemoActivatedTransactionState(
  decision: FundTrackerAIDemoValidityDecision,
  verifiedOpportunity: AiopVerifiedOpportunity,
  authEvent: DemoAuthorizationEvent
): DemoActivatedTransactionState {
  if (decision.decision !== "VALID_FOR_DEMO_ACTIVATION") {
    throw new Error("DEMO_ATS_REQUIRES_VALID_DEMO_DECISION");
  }

  return {
    __brand: "DEMO_ACTIVATED_TRANSACTION_STATE",
    transactionId: "demo_tx_001",
    demoAtsId: "demo_ats_001",
    authId: authEvent.authorizationId,
    validity: "verified",
    mode: "demo",
    capture: "not_executed",
    settlement: "not_executed",
    authority: "none",
    fundTrackerDecisionId: decision.decisionId,
    verifiedOpportunityId: verifiedOpportunity.verifiedOpportunityId,
    createdAt: now(),
    boundary: {
      demoAtsOnly: true,
      notLiveATS: true,
      createsNoLiveTransactionTruth: true,
      createsNoPaymentProcessing: true,
      createsNoFundsCapture: true,
      createsNoSettlement: true,
      createsNoCustodyTransfer: true,
      createsNoRuntimeActivation: true,
      createsNoLegalAuthority: true,
      createsNoFinancialAuthority: true
    }
  };
}

export function createLawAidAIDemoUnlock(
  demoAts: DemoActivatedTransactionState
): LawAidAIDemoUnlock {
  return {
    __brand: "LAWAIDAI_DEMO_UNLOCK",
    unlockId: "lawaidai_demo_unlock_001",
    transactionId: demoAts.transactionId,
    demoAtsId: demoAts.demoAtsId,
    unlockState: "DEMO_OUTPUT_UNLOCKED",
    unlockedOutputs: [
      "demo_confirmation_panel",
      "demo_export_preview",
      "demo_product_output_preview"
    ],
    consumerMessage:
      "Demo output unlocked after transaction validity was confirmed. No live payment was processed.",
    createdAt: now(),
    boundary: {
      unlockIsDemoOnly: true,
      unlockIsNotFinancialCompletion: true,
      unlockCreatesNoLegalAuthority: true,
      unlockCreatesNoFinancialAuthority: true,
      unlockCreatesNoRuntimeActivation: true,
      displayIsNotAuthority: true
    }
  };
}

export function runLawAidAIDemoModeTransactionValidityHarness(
  input: DemoModeInput
): LawAidAIDemoRunRecord {
  const refusalCodes = validateDemoModeInput(input);

  if (refusalCodes.length > 0) {
    return {
      __brand: "LAWAIDAI_DEMO_RUN_RECORD",
      runId: "lawaidai_demo_run_001",
      status: "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_REFUSED",
      stage: "RAW_SIGNAL",
      refusalCodes,
      approvedDemoLanguage: buildApprovedDemoLanguage(),
      prohibitedDemoLanguage: buildProhibitedDemoLanguage(),
      boundary: boundary()
    };
  }

  const rawSignal = createRawSignal(input);
  const diceCapturedSignal = createDiceCapturedSignal(rawSignal, input);
  const aiopVerifiedOpportunity = createAiopVerifiedOpportunity(diceCapturedSignal, input);
  const demoAuthorizationEvent = simulateDemo4242Authorization(input);
  const fundTrackerDecision = evaluateFundTrackerAIDemoValidity(aiopVerifiedOpportunity, demoAuthorizationEvent);

  if (fundTrackerDecision.decision !== "VALID_FOR_DEMO_ACTIVATION") {
    return {
      __brand: "LAWAIDAI_DEMO_RUN_RECORD",
      runId: "lawaidai_demo_run_001",
      status: "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_BLOCKED",
      stage: "FUNDTRACKERAI_DEMO_VALIDITY_DECISION",
      rawSignal,
      diceCapturedSignal,
      aiopVerifiedOpportunity,
      demoAuthorizationEvent,
      fundTrackerDecision,
      refusalCodes: ["MISSING_DEMO_AUTH_EVENT"],
      approvedDemoLanguage: buildApprovedDemoLanguage(),
      prohibitedDemoLanguage: buildProhibitedDemoLanguage(),
      boundary: boundary()
    };
  }

  const demoActivatedTransactionState = createDemoActivatedTransactionState(
    fundTrackerDecision,
    aiopVerifiedOpportunity,
    demoAuthorizationEvent
  );

  const lawAidAIDemoUnlock = createLawAidAIDemoUnlock(demoActivatedTransactionState);

  return {
    __brand: "LAWAIDAI_DEMO_RUN_RECORD",
    runId: "lawaidai_demo_run_001",
    status: "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_READY",
    stage: "LAWAIDAI_DEMO_UNLOCK",
    rawSignal,
    diceCapturedSignal,
    aiopVerifiedOpportunity,
    demoAuthorizationEvent,
    fundTrackerDecision,
    demoActivatedTransactionState,
    lawAidAIDemoUnlock,
    refusalCodes: [],
    approvedDemoLanguage: buildApprovedDemoLanguage(),
    prohibitedDemoLanguage: buildProhibitedDemoLanguage(),
    boundary: boundary()
  };
}

export function buildDefaultDemoModeInput(): DemoModeInput {
  return {
    demoMode: true,
    demoCardSignal: "4242",
    serviceRequest: "LawAidAI demo service request",
    userIntent: "User wants to preview a governed demo output.",
    selectedService: "demo_document_export_preview",
    commitmentTermsAccepted: true,
    policyAcknowledged: true,
    attemptsRealPayment: false,
    attemptsLiveRail: false,
    attemptsCapture: false,
    attemptsSettlement: false,
    attemptsLiveATS: false,
    attemptsLegalAuthorityClaim: false,
    attemptsFinancialAuthorityClaim: false
  };
}

export const LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE = {
  name: "LawAidAI Demo Mode Transaction Validity Harness",
  class: "DEMO_MODE_PRE_CAPTURE_VALIDITY_AND_UNLOCK_LAYER",
  purpose:
    "Demonstrate pre-capture transaction validity using a simulated 4242 authorization signal, FundTrackerAI demo validity logic, demo-only ATS, and LawAidAI demo unlock without creating payment processing, settlement, live ATS, legal authority, financial authority, or launch approval.",
  boundary: {
    demoOnly: true,
    card4242IsDemoAuthorizationSignalOnly: true,
    notPaymentIntegration: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noFundsCaptured: true,
    noSettlementCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalAuthorityCreated: true,
    noFinancialAuthorityCreated: true,
    notPublicLaunchApproval: true
  }
} as const;
