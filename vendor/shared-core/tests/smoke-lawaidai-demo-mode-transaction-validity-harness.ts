import {
  buildDefaultDemoModeInput,
  LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE,
  runLawAidAIDemoModeTransactionValidityHarness
} from "../lawaidai-demo-mode-transaction-validity-harness";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.demoOnly === true, "Doctrine locks demo only");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.card4242IsDemoAuthorizationSignalOnly === true, "Doctrine locks 4242 as demo signal only");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.notPaymentIntegration === true, "Doctrine blocks payment integration");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noFundsCaptured === true, "Doctrine captures no funds");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noSettlementCreated === true, "Doctrine creates no settlement");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noLegalAuthorityCreated === true, "Doctrine creates no legal authority");
assert(LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_DOCTRINE.boundary.noFinancialAuthorityCreated === true, "Doctrine creates no financial authority");

const success = runLawAidAIDemoModeTransactionValidityHarness(buildDefaultDemoModeInput());

assert(success.status === "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_READY", "Demo mode harness ready");
assert(success.stage === "LAWAIDAI_DEMO_UNLOCK", "Demo flow reaches LawAidAI demo unlock");
assert(success.rawSignal?.__brand === "RAW_SIGNAL", "Raw Signal created");
assert(success.diceCapturedSignal?.__brand === "DICE_CAPTURED_SIGNAL", "DICE Captured Signal created");
assert(success.aiopVerifiedOpportunity?.__brand === "AIOP_VERIFIED_OPPORTUNITY", "AIOP Verified Opportunity created");
assert(success.demoAuthorizationEvent?.__brand === "DEMO_AUTHORIZATION_EVENT", "Demo authorization event created");
assert(success.demoAuthorizationEvent?.demoCardSignal === "4242", "4242 used as demo authorization signal");
assert(success.demoAuthorizationEvent?.capture === "not_executed", "Demo auth capture not executed");
assert(success.demoAuthorizationEvent?.settlement === "not_executed", "Demo auth settlement not executed");
assert(success.demoAuthorizationEvent?.authority === "none", "Demo auth creates no authority");
assert(success.fundTrackerDecision?.decision === "VALID_FOR_DEMO_ACTIVATION", "FundTrackerAI demo validity decision valid");
assert(success.demoActivatedTransactionState?.mode === "demo", "Demo ATS mode demo");
assert(success.demoActivatedTransactionState?.capture === "not_executed", "Demo ATS capture not executed");
assert(success.demoActivatedTransactionState?.settlement === "not_executed", "Demo ATS settlement not executed");
assert(success.demoActivatedTransactionState?.authority === "none", "Demo ATS authority none");
assert(success.demoActivatedTransactionState?.boundary.notLiveATS === true, "Demo ATS not live ATS");
assert(success.lawAidAIDemoUnlock?.unlockState === "DEMO_OUTPUT_UNLOCKED", "LawAidAI demo output unlocked");
assert(success.lawAidAIDemoUnlock?.boundary.displayIsNotAuthority === true, "Display is not authority");
assert(success.approvedDemoLanguage.includes("This demo shows how a transaction can be validated before money is captured."), "Approved demo language present");
assert(success.prohibitedDemoLanguage.includes("This processes live payments."), "Prohibited payment language present");

const badCard = runLawAidAIDemoModeTransactionValidityHarness({
  ...buildDefaultDemoModeInput(),
  demoCardSignal: "1234" as "4242"
});

assert(badCard.status === "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_REFUSED", "Invalid demo card refused");
assert(badCard.refusalCodes.includes("INVALID_DEMO_CARD_SIGNAL"), "Invalid demo card refusal present");

const realPaymentAttempt = runLawAidAIDemoModeTransactionValidityHarness({
  ...buildDefaultDemoModeInput(),
  attemptsRealPayment: true,
  attemptsLiveRail: true,
  attemptsCapture: true,
  attemptsSettlement: true,
  attemptsLiveATS: true,
  attemptsLegalAuthorityClaim: true,
  attemptsFinancialAuthorityClaim: true
});

assert(realPaymentAttempt.status === "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_REFUSED", "Real payment/live authority attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("REAL_PAYMENT_ATTEMPT_REFUSED"), "Real payment attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("LIVE_RAIL_ATTEMPT_REFUSED"), "Live rail attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("CAPTURE_ATTEMPT_REFUSED"), "Capture attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("SETTLEMENT_ATTEMPT_REFUSED"), "Settlement attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("LIVE_ATS_ATTEMPT_REFUSED"), "Live ATS attempt refused");
assert(realPaymentAttempt.refusalCodes.includes("LEGAL_AUTHORITY_CLAIM_REFUSED"), "Legal authority claim refused");
assert(realPaymentAttempt.refusalCodes.includes("FINANCIAL_AUTHORITY_CLAIM_REFUSED"), "Financial authority claim refused");

const missingCommitment = runLawAidAIDemoModeTransactionValidityHarness({
  ...buildDefaultDemoModeInput(),
  commitmentTermsAccepted: false
});

assert(missingCommitment.status === "LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_REFUSED", "Missing commitment refused");
assert(missingCommitment.refusalCodes.includes("MISSING_COMMITMENT_TERMS"), "Missing commitment refusal present");

const noLiveLeak =
  success.boundary.noLiveRailsCreated === true &&
  success.boundary.noLivePaymentProcessingCreated === true &&
  success.boundary.noFundsCaptured === true &&
  success.boundary.noSettlementCreated === true &&
  success.boundary.noLiveTransactionTruthCreated === true &&
  success.boundary.noLiveATSCreated === true &&
  success.boundary.noCustodyTransferCreated === true &&
  success.boundary.noRuntimeActivationCreated === true &&
  success.boundary.noLegalAuthorityCreated === true &&
  success.boundary.noFinancialAuthorityCreated === true &&
  success.boundary.notPublicLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from LawAidAI demo mode harness");

console.log("");
console.log("LAW_AID_AI_DEMO_MODE_TRANSACTION_VALIDITY_HARNESS_SMOKE=PASS");
