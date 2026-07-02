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
  loadLedgerEntries,
  loadProjectionRecords,
  verifyProjectionLedgerFiles,
  writeProjectionToFileLedger
} from "../projection-ledger-file";

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
  const rootDir = "D:/DEV/AIVA/shared-data/projection-ledger-file/stage4-smoke";
  cleanDir(rootDir);

  const paths = buildProjectionLedgerFilePaths(rootDir);

  const activatedState: ActivatedTransactionStateLite = {
    activatedTransactionStateId: "ats_stage4_001",
    status: "ACTIVATED",
    sourceAuthority: "FundTrackerAI",
    transactionProofRef: "proof_ref_stage4_001",
    verifiedCommitment: true,
    entitlementState: "ENTITLED",
    amountMinor: 38900,
    currency: "USD",
    merchantContinuityRef: "merchant_ref_stage4_001",
    createdAt: "2026-04-28T00:00:00.000Z"
  };

  const request: FinancialMemoryProjectionRequest = {
    requestId: "stage4_request_001",
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
    ledgerSafeSummary: "Stage 4 verified commitment summary; redacted and ledger-safe.",
    continuityPattern: "File-backed projection may support future continuity without exposing source data.",
    userContainerScope: "user_container_stage4_001",
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

  assert(projectionDecision.status === "FUNDTRACKER_SOULBASE_PROJECTION_READY", "Stage 2 projection ready");
  assert(projectionDecision.projection !== undefined, "Projection exists");

  const projection = projectionDecision.projection;
  if (!projection) throw new Error("PROJECTION_MISSING_AFTER_ASSERT");

  const writeDecision = await writeProjectionToFileLedger({
    projection,
    paths,
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(writeDecision.status === "PROJECTION_FILE_LEDGER_WRITE_ACCEPTED", "File ledger write accepted");
  assert(writeDecision.accepted === true, "File ledger accepted true");
  assert(writeDecision.projectionWritten === true, "Projection JSONL written");
  assert(writeDecision.ledgerEntryWritten === true, "Ledger JSONL written");
  assert(writeDecision.ledgerEntry !== undefined, "Ledger entry returned");
  assert(writeDecision.boundary.fileLedgerIsNotPaymentAuthority === true, "File ledger is not payment authority");
  assert(writeDecision.boundary.fileLedgerIsNotCustodyTransfer === true, "File ledger is not custody transfer");

  assert(fs.existsSync(paths.projectionFile), "Projection file exists");
  assert(fs.existsSync(paths.ledgerFile), "Ledger file exists");

  const loadedProjections = loadProjectionRecords(paths);
  const loadedLedger = loadLedgerEntries(paths);

  assert(loadedProjections.ok === true, "Projection file parses");
  assert(loadedLedger.ok === true, "Ledger file parses");

  if (!loadedProjections.ok || !loadedLedger.ok) throw new Error("LOAD_FAILED_AFTER_ASSERT");

  assert(loadedProjections.projections.length === 1, "One projection persisted");
  assert(loadedLedger.entries.length === 1, "One ledger entry persisted");

  const verifyClean = await verifyProjectionLedgerFiles(paths);

  assert(verifyClean.status === "PROJECTION_FILE_LEDGER_VERIFIED", "Clean file ledger verifies");
  assert(verifyClean.verified === true, "Clean file ledger verified true");
  assert(verifyClean.projectionCount === 1, "Clean verify projection count one");
  assert(verifyClean.ledgerEntryCount === 1, "Clean verify ledger entry count one");
  assert(fs.existsSync(paths.recoveryReportFile), "Recovery report exists after clean verify");
  assert(verifyClean.boundary.verifierCreatesNoPaymentAuthority === true, "Verifier creates no payment authority");
  assert(verifyClean.boundary.verifierCreatesNoCustodyTransfer === true, "Verifier creates no custody transfer");

  const replayDecision = await writeProjectionToFileLedger({
    projection,
    paths,
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(replayDecision.status === "PROJECTION_FILE_LEDGER_WRITE_REFUSED", "Replay file write refused");
  assert(replayDecision.accepted === false, "Replay accepted false");
  assert(replayDecision.refusalReasons.includes("PROJECTION_FILE_LEDGER_REPLAY_REFUSED"), "File replay refusal present");

  const wrongConsumerDecision = await writeProjectionToFileLedger({
    projection: {
      ...projection,
      projectionId: "projection_stage4_wrong_consumer",
      activatedTransactionStateId: "ats_stage4_wrong_consumer"
    },
    paths,
    downstreamConsumerId: "WrongConsumer"
  });

  assert(wrongConsumerDecision.status === "PROJECTION_FILE_LEDGER_WRITE_REFUSED", "Wrong consumer write refused");
  assert(wrongConsumerDecision.accepted === false, "Wrong consumer accepted false");
  assert(wrongConsumerDecision.refusalReasons.includes("PROJECTION_FILE_LEDGER_DOWNSTREAM_REFUSED"), "Wrong consumer refusal present");

  const corruptRoot = "D:/DEV/AIVA/shared-data/projection-ledger-file/stage4-corrupt-smoke";
  cleanDir(corruptRoot);

  const corruptPaths = buildProjectionLedgerFilePaths(corruptRoot);

  const cleanForCorrupt = await writeProjectionToFileLedger({
    projection: {
      ...projection,
      projectionId: "projection_stage4_corrupt",
      activatedTransactionStateId: "ats_stage4_corrupt"
    },
    paths: corruptPaths,
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(cleanForCorrupt.accepted === true, "Corrupt setup write accepted");

  const rawLedger = fs.readFileSync(corruptPaths.ledgerFile, "utf8");
  const corruptedLedger = rawLedger.replace(/"projectionHash":"[a-f0-9]{64}"/, `"projectionHash":"${"0".repeat(64)}"`);
  fs.writeFileSync(corruptPaths.ledgerFile, corruptedLedger, "utf8");

  const corruptVerify = await verifyProjectionLedgerFiles(corruptPaths);

  assert(corruptVerify.status === "PROJECTION_FILE_LEDGER_REFUSED", "Corrupted file ledger refused");
  assert(corruptVerify.verified === false, "Corrupted file ledger verified false");
  assert(corruptVerify.refusalReasons.includes("PROJECTION_FILE_LEDGER_TAMPER_DETECTED"), "File tamper refusal present");
  assert(corruptVerify.recoveryReport !== undefined, "Recovery report returned for corruption");
  assert(corruptVerify.recoveryReport?.boundary.humanReviewRequiredForRepair === true, "Human review required for repair");

  const parseRoot = "D:/DEV/AIVA/shared-data/projection-ledger-file/stage4-parse-smoke";
  cleanDir(parseRoot);

  const parsePaths = buildProjectionLedgerFilePaths(parseRoot);
  fs.writeFileSync(parsePaths.projectionFile, "{bad json\n", "utf8");
  fs.writeFileSync(parsePaths.ledgerFile, "", "utf8");

  const parseVerify = await verifyProjectionLedgerFiles(parsePaths);

  assert(parseVerify.status === "PROJECTION_FILE_LEDGER_REFUSED", "Parse-corrupt ledger refused");
  assert(parseVerify.refusalReasons.includes("PROJECTION_FILE_LEDGER_PARSE_FAILED"), "Parse failure refusal present");
  assert(parseVerify.recoveryReport?.boundary.recoveryReportIsNotRepair === true, "Recovery report is not repair");

  console.log("");
  console.log("PROJECTION_LEDGER_STAGE_4_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});





