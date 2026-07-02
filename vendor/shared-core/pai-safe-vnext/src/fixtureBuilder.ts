import {
  buildPaiSafeEmptyUiState,
  buildPaiSafeLoadingUiState,
  buildPaiSafeSurfaceContractPacket,
  buildPaiSafeUiStatePacket,
  buildPaiSafeUnavailableUiState,
  projectPaiSafeTransactionState,
  runPaiSafeTransactionCircuit,
  type PaiSafeTransactionRequest
} from "./index.js";

import type {
  PaiSafeFixtureExportRecord,
  PaiSafeFixtureScenario
} from "./fixtureContracts.js";

const FIXTURE_TIME = "2026-05-11T16:00:00.000Z";

export function buildPaiSafeFixtureRecord(
  scenario: PaiSafeFixtureScenario,
  generatedAt = FIXTURE_TIME
): PaiSafeFixtureExportRecord {
  return {
    scenario,
    fixtureId: `pai_safe_fixture_${scenario.toLowerCase()}`,
    generatedAt,
    source: "PAI_SAFE_PASS_6_FIXTURE_EXPORT_PACKET",
    authority: {
      createsTruth: false,
      mutatesState: false,
      authorizesPayment: false,
      writesCustody: false,
      promotesDoctrine: false,
      uiRendersLater: true
    },
    uiState: buildUiStateForScenario(scenario)
  };
}

export function buildAllPaiSafeFixtureRecords(
  generatedAt = FIXTURE_TIME
): PaiSafeFixtureExportRecord[] {
  return [
    buildPaiSafeFixtureRecord("SAFE", generatedAt),
    buildPaiSafeFixtureRecord("HOLD", generatedAt),
    buildPaiSafeFixtureRecord("REFUSED", generatedAt),
    buildPaiSafeFixtureRecord("EMPTY", generatedAt),
    buildPaiSafeFixtureRecord("LOADING", generatedAt),
    buildPaiSafeFixtureRecord("UNAVAILABLE", generatedAt)
  ];
}

function buildUiStateForScenario(scenario: PaiSafeFixtureScenario) {
  if (scenario === "EMPTY") return buildPaiSafeEmptyUiState();
  if (scenario === "LOADING") return buildPaiSafeLoadingUiState();
  if (scenario === "UNAVAILABLE") return buildPaiSafeUnavailableUiState("Fixture unavailable state.");

  const request = requestForScenario(scenario);
  const circuit = runPaiSafeTransactionCircuit(request, FIXTURE_TIME);
  const projection = projectPaiSafeTransactionState(circuit);
  const surface = buildPaiSafeSurfaceContractPacket(projection);

  return buildPaiSafeUiStatePacket(surface);
}

function requestForScenario(scenario: "SAFE" | "HOLD" | "REFUSED"): PaiSafeTransactionRequest {
  const base: PaiSafeTransactionRequest = {
    transactionId: `txn_fixture_${scenario.toLowerCase()}`,
    merchant: {
      merchantId: "merchant_fixture_001",
      displayName: "Fixture Verified Merchant",
      verifiedIdentity: true,
      knownProcessorAccount: true,
      expectedProcessorAccount: "acct_fixture_verified_001",
      supportedDestinationTypes: ["processor_account"]
    },
    consumer: {
      consumerId: "consumer_fixture_001",
      displayName: "Fixture Consumer",
      acknowledgedTerms: true,
      acknowledgmentText: "I acknowledge the transaction terms and refund policy."
    },
    amountCents: 12500,
    currency: "USD",
    purpose: "Fixture service package",
    paymentDestination: "acct_fixture_verified_001",
    expectedDestination: "acct_fixture_verified_001",
    destinationType: "processor_account",
    termsText: "Fixture service will be delivered after confirmed payment and merchant acceptance.",
    refundPolicyText: "Fixture refunds are reviewed within seven business days based on delivery status.",
    metadata: {
      routeLocked: true,
      routeOverride: false
    },
    createdAt: FIXTURE_TIME
  };

  if (scenario === "SAFE") return base;

  if (scenario === "HOLD") {
    return {
      ...base,
      transactionId: "txn_fixture_hold",
      amountCents: 75000
    };
  }

  return {
    ...base,
    transactionId: "txn_fixture_refused",
    paymentDestination: "acct_fixture_bad_destination_001"
  };
}