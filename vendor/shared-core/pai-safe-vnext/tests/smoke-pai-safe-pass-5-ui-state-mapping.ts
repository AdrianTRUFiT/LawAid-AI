import {
  buildPaiSafeEmptyUiState,
  buildPaiSafeLoadingUiState,
  buildPaiSafeSurfaceContractPacket,
  buildPaiSafeUiStatePacket,
  buildPaiSafeUnavailableUiState,
  projectPaiSafeTransactionState,
  runPaiSafeTransactionCircuit,
  type PaiSafeTransactionRequest
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const now = "2026-05-11T15:00:00.000Z";

const baseRequest: PaiSafeTransactionRequest = {
  transactionId: "txn_ui_safe",
  merchant: {
    merchantId: "merchant_001",
    displayName: "Verified Merchant",
    verifiedIdentity: true,
    knownProcessorAccount: true,
    expectedProcessorAccount: "acct_verified_merchant_001",
    supportedDestinationTypes: ["processor_account"]
  },
  consumer: {
    consumerId: "consumer_001",
    displayName: "Consumer One",
    acknowledgedTerms: true,
    acknowledgmentText: "I acknowledge the transaction terms and refund policy."
  },
  amountCents: 12500,
  currency: "USD",
  purpose: "Service package",
  paymentDestination: "acct_verified_merchant_001",
  expectedDestination: "acct_verified_merchant_001",
  destinationType: "processor_account",
  termsText: "Service will be delivered after confirmed payment and merchant acceptance.",
  refundPolicyText: "Refunds are reviewed within seven business days based on delivery status.",
  metadata: {
    routeLocked: true,
    routeOverride: false
  },
  createdAt: now
};

function buildUi(request: PaiSafeTransactionRequest) {
  const circuit = runPaiSafeTransactionCircuit(request, now);
  const projection = projectPaiSafeTransactionState(circuit);
  const surface = buildPaiSafeSurfaceContractPacket(projection);
  return {
    circuit,
    projection,
    surface,
    ui: buildPaiSafeUiStatePacket(surface)
  };
}

const safe = buildUi(baseRequest);

assert(safe.ui.decision === "SAFE", "SAFE UI decision mismatch");
assert(safe.ui.merchantScreen.stateKind === "SAFE_STATE", "SAFE merchant state kind mismatch");
assert(safe.ui.consumerScreen.stateKind === "SAFE_STATE", "SAFE consumer state kind mismatch");
assert(safe.ui.internalReviewScreen.stateKind === "SAFE_STATE", "SAFE internal state kind mismatch");
assert(safe.ui.merchantScreen.allowedActions.includes("FULFILL_TRANSACTION"), "SAFE merchant should allow fulfill");
assert(safe.ui.consumerScreen.allowedActions.includes("VIEW_RECEIPT"), "SAFE consumer should view receipt");
assert(safe.ui.uiAuthority.createsTruth === false, "UI must not create truth");
assert(safe.ui.uiAuthority.mutatesState === false, "UI must not mutate state");
assert(safe.ui.uiAuthority.authorizesPayment === false, "UI must not authorize payment");
assert(safe.ui.uiAuthority.writesCustody === false, "UI must not write custody");

const hold = buildUi({
  ...baseRequest,
  transactionId: "txn_ui_hold",
  amountCents: 75000
});

assert(hold.ui.decision === "HOLD", "HOLD UI decision mismatch");
assert(hold.ui.merchantScreen.stateKind === "HOLD_STATE", "HOLD merchant state kind mismatch");
assert(hold.ui.consumerScreen.stateKind === "HOLD_STATE", "HOLD consumer state kind mismatch");
assert(hold.ui.internalReviewScreen.stateKind === "HOLD_STATE", "HOLD internal state kind mismatch");
assert(hold.ui.merchantScreen.allowedActions.includes("REQUEST_REVIEW"), "HOLD merchant should request review");
assert(hold.ui.consumerScreen.allowedActions.includes("WAIT_FOR_REVIEW"), "HOLD consumer should wait");
assert(hold.ui.internalReviewScreen.reviewRequired === true, "HOLD internal reviewRequired mismatch");

const refused = buildUi({
  ...baseRequest,
  transactionId: "txn_ui_refused",
  paymentDestination: "acct_bad_destination_001"
});

assert(refused.ui.decision === "REFUSED", "REFUSED UI decision mismatch");
assert(refused.ui.merchantScreen.stateKind === "REFUSED_STATE", "REFUSED merchant state kind mismatch");
assert(refused.ui.consumerScreen.stateKind === "REFUSED_STATE", "REFUSED consumer state kind mismatch");
assert(refused.ui.internalReviewScreen.stateKind === "REFUSED_STATE", "REFUSED internal state kind mismatch");
assert(refused.ui.merchantScreen.allowedActions.includes("DO_NOT_FULFILL"), "REFUSED merchant should not fulfill");
assert(refused.ui.consumerScreen.allowedActions.includes("DO_NOT_PAY"), "REFUSED consumer should not pay");

const merchantJson = JSON.stringify(refused.ui.merchantScreen);
const consumerJson = JSON.stringify(refused.ui.consumerScreen);
const internalJson = JSON.stringify(refused.ui.internalReviewScreen);

assert(!merchantJson.includes("riskCodes"), "merchant screen must not expose riskCodes");
assert(!merchantJson.includes("requestHash"), "merchant screen must not expose requestHash");
assert(!merchantJson.includes("decisionHash"), "merchant screen must not expose decisionHash");
assert(!merchantJson.includes("recordHash"), "merchant screen must not expose recordHash");
assert(!merchantJson.includes("receiptHash"), "merchant screen must not expose receiptHash");

assert(!consumerJson.includes("riskCodes"), "consumer screen must not expose riskCodes");
assert(!consumerJson.includes("requestHash"), "consumer screen must not expose requestHash");
assert(!consumerJson.includes("decisionHash"), "consumer screen must not expose decisionHash");
assert(!consumerJson.includes("recordHash"), "consumer screen must not expose recordHash");
assert(!consumerJson.includes("receiptHash"), "consumer screen must not expose receiptHash");

assert(internalJson.includes("riskCodes"), "internal screen should expose riskCodes");
assert(internalJson.includes("requestHash"), "internal screen should expose requestHash");
assert(internalJson.includes("decisionHash"), "internal screen should expose decisionHash");
assert(internalJson.includes("recordHash"), "internal screen should expose recordHash");
assert(internalJson.includes("receiptHash"), "internal screen should expose receiptHash");

for (const screen of [refused.ui.merchantScreen, refused.ui.consumerScreen, refused.ui.internalReviewScreen]) {
  assert(screen.readOnlyGuard.readOnly === true, "screen must be read-only");
  assert(screen.readOnlyGuard.canMutateSourceContract === false, "screen must not mutate source contract");
  assert(screen.readOnlyGuard.canModifyTrustDecision === false, "screen must not modify trust decision");
  assert(screen.readOnlyGuard.canModifyProofRecord === false, "screen must not modify proof record");
  assert(screen.readOnlyGuard.canAuthorizePayment === false, "screen must not authorize payment");
  assert(screen.readOnlyGuard.canWriteCustody === false, "screen must not write custody");
  assert(screen.readOnlyGuard.canPromoteDoctrine === false, "screen must not promote doctrine");
}

assert(refused.ui.merchantScreen.blockedActions.includes("AUTHORIZE_PAYMENT"), "merchant blocked payment authorization missing");
assert(refused.ui.consumerScreen.blockedActions.includes("WRITE_CUSTODY"), "consumer blocked custody missing");
assert(refused.ui.internalReviewScreen.blockedActions.includes("MODIFY_TRUST_DECISION"), "internal blocked trust mutation missing");

assert(
  refused.ui.merchantScreen.headline === refused.surface.merchantCard.labels.statusHeadline,
  "merchant copy-safe headline mismatch"
);

assert(
  refused.ui.consumerScreen.headline === refused.surface.consumerReceiptView.labels.statusHeadline,
  "consumer copy-safe headline mismatch"
);

assert(
  refused.ui.merchantScreen.proofLabel === refused.surface.merchantCard.labels.proofLabel,
  "merchant proof label mismatch"
);

assert(
  refused.ui.consumerScreen.proofLabel === refused.surface.consumerReceiptView.labels.proofLabel,
  "consumer proof label mismatch"
);

const empty = buildPaiSafeEmptyUiState();
assert(empty.decision === null, "empty state decision should be null");
assert(empty.merchantScreen.screenMode === "EMPTY", "empty merchant mode mismatch");
assert(empty.consumerScreen.allowedActions.length === 0, "empty consumer should have no allowed actions");
assert(empty.internalReviewScreen.blockedActions.includes("AUTHORIZE_PAYMENT"), "empty state should block payment authorization");

const loading = buildPaiSafeLoadingUiState();
assert(loading.decision === null, "loading state decision should be null");
assert(loading.merchantScreen.screenMode === "LOADING", "loading merchant mode mismatch");
assert(loading.consumerScreen.allowedActions.length === 0, "loading consumer should have no allowed actions");
assert(loading.internalReviewScreen.blockedActions.includes("WRITE_CUSTODY"), "loading state should block custody");

const unavailable = buildPaiSafeUnavailableUiState("Unavailable during test.");
assert(unavailable.decision === null, "unavailable state decision should be null");
assert(unavailable.merchantScreen.screenMode === "UNAVAILABLE", "unavailable merchant mode mismatch");
assert(unavailable.consumerScreen.primaryMessage === "Unavailable during test.", "unavailable message mismatch");
assert(unavailable.internalReviewScreen.blockedActions.includes("PROMOTE_DOCTRINE"), "unavailable state should block doctrine promotion");

const first = buildUi({ ...baseRequest, transactionId: "txn_ui_deterministic" }).ui;
const second = buildUi({ ...baseRequest, transactionId: "txn_ui_deterministic" }).ui;

assert(JSON.stringify(first) === JSON.stringify(second), "UI state determinism failed");

assert(Object.isFrozen(first), "UI state packet should be frozen");
assert(Object.isFrozen(first.merchantScreen), "merchant screen state should be frozen");
assert(Object.isFrozen(first.consumerScreen), "consumer screen state should be frozen");
assert(Object.isFrozen(first.internalReviewScreen), "internal screen state should be frozen");

console.log("PAI_SAFE_PASS_5_UI_STATE_MAPPING=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "merchant screen-state fixture",
      "consumer screen-state fixture",
      "internal review screen-state fixture",
      "SAFE screen state",
      "HOLD screen state",
      "REFUSED screen state",
      "empty state",
      "loading state",
      "unavailable state",
      "read-only enforcement",
      "blocked action enforcement",
      "hidden-field leakage tests",
      "copy-safe label consistency",
      "deterministic screen-state output",
      "frozen screen-state packet"
    ],
    status: "PASS"
  },
  null,
  2
));