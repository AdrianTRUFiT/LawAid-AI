declare const require: any;

import {
  evaluateFundTrackerToSoulBaseProjection
} from "../fundtracker-soulbase-contract";
import type {
  ActivatedTransactionStateLite,
  FinancialMemoryProjectionRequest
} from "../fundtracker-soulbase-contract";
import {
  buildProjectionLedgerFilePaths,
  writeProjectionToFileLedger
} from "../projection-ledger-file";
import {
  createSoulRegistryAnchor,
  verifySoulRegistryReceipt
} from "../soulregistry-anchor";
import {
  FRAUDAI_ADVERSARIAL_POLICY,
  runFraudAIAdversarialHarness
} from "../fraudai-adversarial-harness";

const fs = require("fs");

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }

  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const rootDir = "D:/DEV/AIVA/shared-data/fraudai-adversarial-harness/stage6-smoke";
  const ledgerRoot = rootDir + "/ledger";

  cleanDir(rootDir);
  cleanDir(ledgerRoot);

  const activatedState: ActivatedTransactionStateLite = {
    activatedTransactionStateId: "ats_stage6_001",
    status: "ACTIVATED",
    sourceAuthority: "FundTrackerAI",
    transactionProofRef: "proof_ref_stage6_001",
    verifiedCommitment: true,
    entitlementState: "ENTITLED",
    amountMinor: 77600,
    currency: "USD",
    merchantContinuityRef: "merchant_ref_stage6_001",
    createdAt: "2026-04-28T00:00:00.000Z"
  };

  const request: FinancialMemoryProjectionRequest = {
    requestId: "stage6_request_001",
    stage2ExplicitlyAuthorized: true,
    activatedTransactionState: activatedState,
    custodyClass: "LEDGER_SAFE_SUMMARY",
    redactionLevel: "SUMMARY_ONLY",
    retentionRule: "CONTAINER_BOUND",
    authorization: {
      userContainerAuthorized: true,
      downstreamConsumerPermission: true,
      retentionApproved: true,
      redactionConfirmed: true
    },
    ledgerSafeSummary: "Stage 6 adversarial summary; public fraud tests receive hashes only.",
    continuityPattern: "Adversarial harness proves mutation resistance without exposing source data.",
    userContainerScope: "user_container_stage6_001",
    downstreamConsumerId: "SoulBaseAI",
    containsRawProcessorObject: false,
    containsRawBankStatement: false,
    containsFullAccountNumber: false,
    containsUnredactedPaymentMethod: false,
    containsPrivateSourceDocument: false,
    containsLegalEvidenceFile: false,
    containsUnrestrictedFinancialHistory: false,
    processorEventTreatedAsTruth: false
  };

  const projectionDecision = evaluateFundTrackerToSoulBaseProjection(request);

  assert(projectionDecision.status === "FUNDTRACKER_SOULBASE_PROJECTION_READY", "Projection ready for adversarial harness");
  assert(projectionDecision.projection !== undefined, "Projection exists for adversarial harness");

  const projection = projectionDecision.projection;
  if (!projection) throw new Error("PROJECTION_MISSING_AFTER_ASSERT");

  const ledgerPaths = buildProjectionLedgerFilePaths(ledgerRoot);

  const fileWrite = await writeProjectionToFileLedger({
    projection,
    paths: ledgerPaths,
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(fileWrite.status === "PROJECTION_FILE_LEDGER_WRITE_ACCEPTED", "File ledger write accepted before adversarial harness");
  assert(fileWrite.ledgerEntry !== undefined, "Ledger entry exists before adversarial harness");

  const ledgerEntry = fileWrite.ledgerEntry;
  if (!ledgerEntry) throw new Error("LEDGER_ENTRY_MISSING_AFTER_ASSERT");

  const anchorDecision = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_stage6_001",
    projectionId: projection.projectionId,
    projectionHash: ledgerEntry.projectionHash,
    ledgerEntryHash: ledgerEntry.entryHash,
    ledgerEntryId: ledgerEntry.entryId,
    sourceAuthority: "FundTrackerAI",
    destination: "SoulBaseAI",
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
    createdAt: ledgerEntry.createdAt,
    privateCustodyPointer: "",
    containsRawProjection: false,
    containsRawFinancialData: false,
    containsPrivateSourcePath: false
  });

  assert(anchorDecision.status === "SOULREGISTRY_ANCHOR_ACCEPTED", "Baseline anchor accepted");
  assert(anchorDecision.anchor !== undefined, "Baseline anchor exists");
  assert(anchorDecision.receipt !== undefined, "Baseline receipt exists");

  const anchor = anchorDecision.anchor;
  const receipt = anchorDecision.receipt;

  if (!anchor || !receipt) throw new Error("ANCHOR_OR_RECEIPT_MISSING_AFTER_ASSERT");

  const baselineVerify = await verifySoulRegistryReceipt(anchor, receipt);

  assert(baselineVerify.status === "SOULREGISTRY_RECEIPT_VERIFIED", "Baseline receipt verifies before attack");
  assert(baselineVerify.verified === true, "Baseline receipt verified true");

  const harness = await runFraudAIAdversarialHarness(anchor, receipt);

  assert(harness.status === "FRAUDAI_ADVERSARIAL_HARNESS_PASS", "FraudAI adversarial harness passes");
  assert(harness.passed === true, "Harness passed true");
  assert(harness.totalVectors === FRAUDAI_ADVERSARIAL_POLICY.requiredVectors.length, "All required fraud vectors executed");
  assert(harness.refusedOrDetected === harness.totalVectors, "All fraud vectors refused or detected");
  assert(harness.escapedVectors.length === 0, "No fraud vectors escaped");

  const vectors = harness.results.map((result) => result.vector);

  assert(vectors.includes("ANCHOR_HASH_MUTATION"), "Anchor hash mutation tested");
  assert(vectors.includes("RECEIPT_HASH_MUTATION"), "Receipt hash mutation tested");
  assert(vectors.includes("PROJECTION_HASH_MUTATION"), "Projection hash mutation tested");
  assert(vectors.includes("LEDGER_ENTRY_HASH_MUTATION"), "Ledger entry hash mutation tested");
  assert(vectors.includes("SOURCE_AUTHORITY_MUTATION"), "Source authority mutation tested");
  assert(vectors.includes("DESTINATION_MUTATION"), "Destination mutation tested");
  assert(vectors.includes("REGISTRY_NAME_MUTATION"), "Registry name mutation tested");
  assert(vectors.includes("RECEIPT_SWAP"), "Receipt swap tested");
  assert(vectors.includes("BOUNDARY_DOWNGRADE"), "Boundary downgrade tested");
  assert(vectors.includes("RAW_PROJECTION_PUBLIC_LEAK"), "Raw projection leak tested");
  assert(vectors.includes("RAW_FINANCIAL_PUBLIC_LEAK"), "Raw financial leak tested");
  assert(vectors.includes("PRIVATE_CUSTODY_PATH_PUBLIC_LEAK"), "Private custody path leak tested");
  assert(vectors.includes("SYNTHETIC_RECEIPT"), "Synthetic receipt tested");
  assert(vectors.includes("ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION"), "Anchor replay with different projection tested");

  const anchorHashMutation = harness.results.find((result) => result.vector === "ANCHOR_HASH_MUTATION");
  const receiptHashMutation = harness.results.find((result) => result.vector === "RECEIPT_HASH_MUTATION");
  const rawProjectionLeak = harness.results.find((result) => result.vector === "RAW_PROJECTION_PUBLIC_LEAK");
  const rawFinancialLeak = harness.results.find((result) => result.vector === "RAW_FINANCIAL_PUBLIC_LEAK");
  const privatePathLeak = harness.results.find((result) => result.vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK");
  const boundaryDowngrade = harness.results.find((result) => result.vector === "BOUNDARY_DOWNGRADE");

  assert(anchorHashMutation?.detected === true, "Anchor hash mutation detected");
  assert(receiptHashMutation?.detected === true, "Receipt hash mutation detected");
  assert(rawProjectionLeak?.refused === true, "Raw projection public leak refused");
  assert(rawFinancialLeak?.refused === true, "Raw financial public leak refused");
  assert(privatePathLeak?.refused === true, "Private custody path public leak refused");
  assert(boundaryDowngrade?.detected === true, "Boundary downgrade detected");

  assert(harness.boundary.noPaymentAuthorityCreated === true, "Harness creates no payment authority");
  assert(harness.boundary.noTransactionTruthCreated === true, "Harness creates no transaction truth");
  assert(harness.boundary.noCustodyTransferCreated === true, "Harness creates no custody transfer");
  assert(harness.boundary.registryVerifierIsReadOnly === true, "Registry verifier remains read-only");
  assert(harness.boundary.publicPrivateSeparationMaintained === true, "Public/private separation maintained");

  console.log("");
  console.log("FRAUDAI_ADVERSARIAL_HARNESS_STAGE_6_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});



