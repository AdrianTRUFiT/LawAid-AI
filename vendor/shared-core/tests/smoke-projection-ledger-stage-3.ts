import {
  evaluateFundTrackerToSoulBaseProjection
} from "../fundtracker-soulbase-contract";
import type {
  ActivatedTransactionStateLite,
  FinancialMemoryProjectionRequest,
  FundTrackerAIToSoulBaseMemoryProjection
} from "../fundtracker-soulbase-contract";
import {
  appendProjectionToLedger,
  persistProjectionForSoulBaseAI,
  verifyProjectionLedger
} from "../projection-ledger";
import type { ProjectionLedgerEntry } from "../projection-ledger";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

async function main() {
  const activatedState: ActivatedTransactionStateLite = {
    activatedTransactionStateId: "ats_stage3_001",
    status: "ACTIVATED",
    sourceAuthority: "FundTrackerAI",
    transactionProofRef: "proof_ref_stage3_001",
    verifiedCommitment: true,
    entitlementState: "ENTITLED",
    amountMinor: 24750,
    currency: "USD",
    merchantContinuityRef: "merchant_ref_stage3_001",
    createdAt: "2026-04-28T00:00:00.000Z"
  };

  const request: FinancialMemoryProjectionRequest = {
    requestId: "stage3_request_001",
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
    ledgerSafeSummary: "Verified commitment summary; redacted and ledger-safe.",
    continuityPattern: "Pattern may support future continuity without exposing raw source data.",
    userContainerScope: "user_container_stage3_001",
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

  assert(projectionDecision.status === "FUNDTRACKER_SOULBASE_PROJECTION_READY", "Stage 2 projection ready for Stage 3");
  assert(projectionDecision.canEmitProjection === true, "Stage 2 projection can emit");
  assert(projectionDecision.projection !== undefined, "Stage 2 projection exists");

  const projection = projectionDecision.projection;
  if (!projection) throw new Error("PROJECTION_MISSING_AFTER_ASSERT");

  const ledger: ProjectionLedgerEntry[] = [];

  const appendDecision = await appendProjectionToLedger(projection, ledger);

  assert(appendDecision.status === "PROJECTION_LEDGER_ENTRY_ACCEPTED", "Projection ledger append accepted");
  assert(appendDecision.accepted === true, "Projection ledger append accepted true");
  assert(appendDecision.entry !== undefined, "Projection ledger entry created");
  assert(appendDecision.boundary.paymentAuthorityNotCreated === true, "Ledger append creates no payment authority");
  assert(appendDecision.boundary.custodyTransferNotCreated === true, "Ledger append creates no custody transfer");

  if (!appendDecision.entry) throw new Error("LEDGER_ENTRY_MISSING_AFTER_ASSERT");

  ledger.push(appendDecision.entry);

  const lookup: Record<string, FundTrackerAIToSoulBaseMemoryProjection> = {
    [projection.projectionId]: projection
  };

  const verified = await verifyProjectionLedger(ledger, lookup);

  assert(verified.status === "PROJECTION_LEDGER_VERIFIED", "Ledger verifies after append");
  assert(verified.verified === true, "Ledger verified true");
  assert(verified.inspectedEntries === 1, "Ledger inspected one entry");
  assert(typeof verified.lastValidHash === "string" && verified.lastValidHash.length === 64, "Ledger last hash is SHA-256 hex");

  const persistence = await persistProjectionForSoulBaseAI({
    projection,
    ledger: [],
    downstreamConsumerId: "SoulBaseAI"
  });

  assert(persistence.status === "PROJECTION_PERSISTENCE_ACCEPTED", "Persistence adapter accepts valid projection");
  assert(persistence.persisted === true, "Persistence accepted true");
  assert(persistence.record !== undefined, "Persistence record exists");
  assert(persistence.record?.destination === "SoulBaseAI", "Persistence destination is SoulBaseAI");
  assert(persistence.record?.persistenceClass === "AUTHORIZED_MEMORY_PROJECTION", "Persistence class is authorized memory projection");
  assert(persistence.boundary.persistenceIsNotPaymentAuthority === true, "Persistence is not payment authority");
  assert(persistence.boundary.persistenceIsNotTransactionTruth === true, "Persistence is not transaction truth");
  assert(persistence.boundary.persistenceIsNotCustodyTransfer === true, "Persistence is not custody transfer");

  const replay = await appendProjectionToLedger(projection, ledger);

  assert(replay.status === "PROJECTION_LEDGER_ENTRY_REFUSED", "Replay append refused");
  assert(replay.accepted === false, "Replay accepted false");
  assert(replay.refusalReasons.includes("DUPLICATE_PROJECTION_REFUSED"), "Duplicate projection refusal present");
  assert(replay.boundary.duplicateProjectionRefused === true, "Duplicate projection refusal boundary true");

  const wrongConsumer = await persistProjectionForSoulBaseAI({
    projection,
    ledger: [],
    downstreamConsumerId: "SomeOtherConsumer"
  });

  assert(wrongConsumer.status === "PROJECTION_PERSISTENCE_REFUSED", "Wrong downstream consumer refused");
  assert(wrongConsumer.persisted === false, "Wrong consumer persistence false");
  assert(wrongConsumer.downstreamReadiness.ready === false, "Wrong consumer not ready");
  assert(wrongConsumer.downstreamReadiness.allowedToReadRawSource === false, "Wrong consumer cannot read raw source");
  assert(wrongConsumer.downstreamReadiness.allowedToModifyLedger === false, "Wrong consumer cannot modify ledger");
  assert(wrongConsumer.downstreamReadiness.allowedToCreatePaymentAuthority === false, "Wrong consumer cannot create payment authority");

  const tamperedEntry: ProjectionLedgerEntry = {
    ...ledger[0]!,
    projectionHash: "0".repeat(64)
  };

  const tampered = await verifyProjectionLedger([tamperedEntry], lookup);

  assert(tampered.status === "PROJECTION_LEDGER_TAMPER_DETECTED", "Tampered ledger detected");
  assert(tampered.verified === false, "Tampered ledger verified false");
  assert(tampered.refusalReasons.includes("PROJECTION_HASH_MISMATCH"), "Projection hash mismatch detected");
  assert(tampered.refusalReasons.includes("ENTRY_HASH_MISMATCH"), "Entry hash mismatch detected");

  const tamperedPrevHash: ProjectionLedgerEntry = {
    ...ledger[0]!,
    prevHash: "bad_prev_hash"
  };

  const tamperedPrev = await verifyProjectionLedger([tamperedPrevHash], lookup);

  assert(tamperedPrev.status === "PROJECTION_LEDGER_TAMPER_DETECTED", "Tampered previous hash detected");
  assert(tamperedPrev.refusalReasons.includes("PREV_HASH_MISMATCH"), "Previous hash mismatch detected");

  const badAuthorityProjection = {
    ...projection,
    sourceAuthority: "Processor" as "FundTrackerAI"
  };

  const badAuthority = await appendProjectionToLedger(badAuthorityProjection, []);

  assert(badAuthority.status === "PROJECTION_LEDGER_ENTRY_REFUSED", "Bad source authority refused");
  assert(badAuthority.refusalReasons.includes("SOURCE_AUTHORITY_INVALID"), "Source authority invalid refusal present");

  const badDestinationProjection = {
    ...projection,
    destination: "Wallet" as "SoulBaseAI"
  };

  const badDestination = await appendProjectionToLedger(badDestinationProjection, []);

  assert(badDestination.status === "PROJECTION_LEDGER_ENTRY_REFUSED", "Bad destination refused");
  assert(badDestination.refusalReasons.includes("DESTINATION_INVALID"), "Destination invalid refusal present");

  const badBoundaryProjection = {
    ...projection,
    boundary: {
      ...projection.boundary,
      projectionIsNotPaymentAuthority: false as true
    }
  };

  const badBoundary = await appendProjectionToLedger(badBoundaryProjection, []);

  assert(badBoundary.status === "PROJECTION_LEDGER_ENTRY_REFUSED", "Bad boundary refused");
  assert(badBoundary.refusalReasons.includes("BOUNDARY_FLAG_INVALID"), "Boundary flag invalid refusal present");

  console.log("");
  console.log("PROJECTION_LEDGER_STAGE_3_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});







