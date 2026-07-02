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
  buildSoulRegistryAnchorFilePaths,
  createSoulRegistryAnchor,
  loadSoulRegistryAnchors,
  loadSoulRegistryReceipts,
  verifySoulRegistryReceipt,
  writeSoulRegistryAnchorFiles
} from "../soulregistry-anchor";

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
  const rootDir = "D:/DEV/AIVA/shared-data/soulregistry-anchor/stage5-smoke";
  const ledgerRoot = rootDir + "/ledger";
  const registryRoot = rootDir + "/registry";

  cleanDir(rootDir);
  cleanDir(ledgerRoot);
  cleanDir(registryRoot);

  const activatedState: ActivatedTransactionStateLite = {
    activatedTransactionStateId: "ats_stage5_001",
    status: "ACTIVATED",
    sourceAuthority: "FundTrackerAI",
    transactionProofRef: "proof_ref_stage5_001",
    verifiedCommitment: true,
    entitlementState: "ENTITLED",
    amountMinor: 51200,
    currency: "USD",
    merchantContinuityRef: "merchant_ref_stage5_001",
    createdAt: "2026-04-28T00:00:00.000Z"
  };

  const request: FinancialMemoryProjectionRequest = {
    requestId: "stage5_request_001",
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
    ledgerSafeSummary: "Stage 5 verified commitment summary; public registry receives hashes only.",
    continuityPattern: "Registry anchor proves continuity without exposing raw projection or custody data.",
    userContainerScope: "user_container_stage5_001",
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

  assert(projectionDecision.status === "FUNDTRACKER_SOULBASE_PROJECTION_READY", "Projection ready for registry anchor");
  assert(projectionDecision.projection !== undefined, "Projection exists for registry anchor");

  const projection = projectionDecision.projection;
  if (!projection) throw new Error("PROJECTION_MISSING_AFTER_ASSERT");

  const ledgerPaths = buildProjectionLedgerFilePaths(ledgerRoot);

  const fileWrite = await writeProjectionToFileLedger({
    projection,
    paths: ledgerPaths,
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(fileWrite.status === "PROJECTION_FILE_LEDGER_WRITE_ACCEPTED", "File ledger write accepted before registry anchor");
  assert(fileWrite.ledgerEntry !== undefined, "Ledger entry exists before registry anchor");

  const ledgerEntry = fileWrite.ledgerEntry;
  if (!ledgerEntry) throw new Error("LEDGER_ENTRY_MISSING_AFTER_ASSERT");

  const anchorDecision = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_stage5_001",
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

  assert(anchorDecision.status === "SOULREGISTRY_ANCHOR_ACCEPTED", "SoulRegistry? anchor accepted");
  assert(anchorDecision.accepted === true, "SoulRegistry? anchor accepted true");
  assert(anchorDecision.anchor !== undefined, "Public anchor exists");
  assert(anchorDecision.receipt !== undefined, "Public receipt exists");
  assert(anchorDecision.boundary.publicAnchorOnly === true, "Anchor is public-only");
  assert(anchorDecision.boundary.privateCustodySeparated === true, "Private custody separated");
  assert(anchorDecision.boundary.noRawProjectionPublished === true, "No raw projection published");

  const anchor = anchorDecision.anchor;
  const receipt = anchorDecision.receipt;

  if (!anchor || !receipt) throw new Error("ANCHOR_OR_RECEIPT_MISSING_AFTER_ASSERT");

  assert(anchor.registryName === "SoulRegistry?", "Registry name is SoulRegistry?");
  assert(anchor.boundary.anchorExposesNoRawProjection === true, "Anchor exposes no raw projection");
  assert(anchor.boundary.anchorExposesNoRawFinancialData === true, "Anchor exposes no raw financial data");
  assert(anchor.boundary.anchorExposesNoPrivateCustodyPath === true, "Anchor exposes no private custody path");
  assert(receipt.boundary.receiptExposesNoRawProjection === true, "Receipt exposes no raw projection");
  assert(receipt.boundary.receiptExposesNoRawFinancialData === true, "Receipt exposes no raw financial data");
  assert(receipt.boundary.receiptExposesNoPrivateCustodyPath === true, "Receipt exposes no private custody path");

  const verifyReceipt = await verifySoulRegistryReceipt(anchor, receipt);

  assert(verifyReceipt.status === "SOULREGISTRY_RECEIPT_VERIFIED", "SoulRegistry? receipt verified");
  assert(verifyReceipt.verified === true, "SoulRegistry? receipt verified true");
  assert(verifyReceipt.boundary.verifierCreatesNoPaymentAuthority === true, "Receipt verifier creates no payment authority");
  assert(verifyReceipt.boundary.verifierCreatesNoTransactionTruth === true, "Receipt verifier creates no transaction truth");
  assert(verifyReceipt.boundary.verifierCreatesNoCustodyTransfer === true, "Receipt verifier creates no custody transfer");

  const registryPaths = buildSoulRegistryAnchorFilePaths(registryRoot);

  writeSoulRegistryAnchorFiles(registryPaths, anchor, receipt);

  const anchors = loadSoulRegistryAnchors(registryPaths);
  const receipts = loadSoulRegistryReceipts(registryPaths);

  assert(anchors.length === 1, "One public anchor persisted");
  assert(receipts.length === 1, "One public receipt persisted");
  assert(JSON.stringify(anchors[0]).includes("privateCustodyPointer") === false, "Anchor file does not expose private custody pointer");
  assert(JSON.stringify(receipts[0]).includes("privateCustodyPointer") === false, "Receipt file does not expose private custody pointer");
  assert(JSON.stringify(anchors[0]).includes("ledgerSafeSummary") === false, "Anchor file does not expose ledger-safe summary body");
  assert(JSON.stringify(receipts[0]).includes("ledgerSafeSummary") === false, "Receipt file does not expose ledger-safe summary body");

  const rawProjectionAttempt = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_raw_projection",
    projectionId: projection.projectionId,
    projectionHash: ledgerEntry.projectionHash,
    ledgerEntryHash: ledgerEntry.entryHash,
    ledgerEntryId: ledgerEntry.entryId,
    sourceAuthority: "FundTrackerAI",
    destination: "SoulBaseAI",
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
    createdAt: ledgerEntry.createdAt,
    privateCustodyPointer: "",
    containsRawProjection: true,
    containsRawFinancialData: false,
    containsPrivateSourcePath: false
  });

  assert(rawProjectionAttempt.status === "SOULREGISTRY_ANCHOR_REFUSED", "Raw projection anchor refused");
  assert(rawProjectionAttempt.refusalReasons.includes("RAW_PROJECTION_EXPOSURE_REFUSED"), "Raw projection refusal present");

  const rawFinancialAttempt = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_raw_financial",
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
    containsRawFinancialData: true,
    containsPrivateSourcePath: false
  });

  assert(rawFinancialAttempt.status === "SOULREGISTRY_ANCHOR_REFUSED", "Raw financial anchor refused");
  assert(rawFinancialAttempt.refusalReasons.includes("RAW_FINANCIAL_EXPOSURE_REFUSED"), "Raw financial refusal present");

  const privateCustodyAttempt = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_private_path",
    projectionId: projection.projectionId,
    projectionHash: ledgerEntry.projectionHash,
    ledgerEntryHash: ledgerEntry.entryHash,
    ledgerEntryId: ledgerEntry.entryId,
    sourceAuthority: "FundTrackerAI",
    destination: "SoulBaseAI",
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
    createdAt: ledgerEntry.createdAt,
    privateCustodyPointer: "D:/PRIVATE/SoulVault/source.pdf",
    containsRawProjection: false,
    containsRawFinancialData: false,
    containsPrivateSourcePath: true
  });

  assert(privateCustodyAttempt.status === "SOULREGISTRY_ANCHOR_REFUSED", "Private custody path anchor refused");
  assert(privateCustodyAttempt.refusalReasons.includes("PRIVATE_CUSTODY_PATH_EXPOSURE_REFUSED"), "Private custody path refusal present");

  const badAuthorityAttempt = await createSoulRegistryAnchor({
    anchorSourceId: "anchor_source_bad_authority",
    projectionId: projection.projectionId,
    projectionHash: ledgerEntry.projectionHash,
    ledgerEntryHash: ledgerEntry.entryHash,
    ledgerEntryId: ledgerEntry.entryId,
    sourceAuthority: "Processor" as "FundTrackerAI",
    destination: "SoulBaseAI",
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
    createdAt: ledgerEntry.createdAt,
    privateCustodyPointer: "",
    containsRawProjection: false,
    containsRawFinancialData: false,
    containsPrivateSourcePath: false
  });

  assert(badAuthorityAttempt.status === "SOULREGISTRY_ANCHOR_REFUSED", "Bad authority anchor refused");
  assert(badAuthorityAttempt.refusalReasons.includes("SOURCE_AUTHORITY_INVALID"), "Bad authority refusal present");

  const tamperedAnchor = {
    ...anchor,
    projectionHash: "0".repeat(64)
  };

  const tamperedVerify = await verifySoulRegistryReceipt(tamperedAnchor, receipt);

  assert(tamperedVerify.status === "SOULREGISTRY_RECEIPT_REFUSED", "Tampered anchor receipt refused");
  assert(tamperedVerify.verified === false, "Tampered anchor receipt verified false");
  assert(tamperedVerify.refusalReasons.includes("ANCHOR_HASH_MISMATCH"), "Anchor hash mismatch detected");

  const tamperedReceipt = {
    ...receipt,
    anchorHash: "0".repeat(64)
  };

  const tamperedReceiptVerify = await verifySoulRegistryReceipt(anchor, tamperedReceipt);

  assert(tamperedReceiptVerify.status === "SOULREGISTRY_RECEIPT_REFUSED", "Tampered receipt refused");
  assert(tamperedReceiptVerify.refusalReasons.includes("RECEIPT_HASH_MISMATCH"), "Receipt hash mismatch detected");

  console.log("");
  console.log("SOULREGISTRY_ANCHOR_STAGE_5_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});




