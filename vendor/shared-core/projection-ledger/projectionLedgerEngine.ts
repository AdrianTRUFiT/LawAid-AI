import type { FundTrackerAIToSoulBaseMemoryProjection } from "../fundtracker-soulbase-contract";
import type {
  ProjectionLedgerAppendDecision,
  ProjectionLedgerEntry,
  ProjectionLedgerVerificationResult,
  ProjectionRefusalCode
} from "./projectionLedgerContracts";
import { canonicalize, hashCanonical, sha256Hex } from "./projectionHashing";

const GENESIS_HASH = "GENESIS";

function nowIso(): string {
  return new Date().toISOString();
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateProjectionShape(
  projection: FundTrackerAIToSoulBaseMemoryProjection | undefined
): { refusalReasons: ProjectionRefusalCode[]; requiredCorrections: string[] } {
  const refusalReasons: ProjectionRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (!projection) {
    refusalReasons.push("PROJECTION_MISSING");
    requiredCorrections.push("Provide projection.");
    return { refusalReasons, requiredCorrections };
  }

  if (!hasText(projection.projectionId)) {
    refusalReasons.push("PROJECTION_ID_MISSING");
    requiredCorrections.push("Provide projectionId.");
  }

  if (projection.artifactType !== "FundTrackerAIToSoulBaseMemoryProjection") {
    refusalReasons.push("ARTIFACT_TYPE_INVALID");
    requiredCorrections.push("Projection artifactType must be FundTrackerAIToSoulBaseMemoryProjection.");
  }

  if (projection.sourceAuthority !== "FundTrackerAI") {
    refusalReasons.push("SOURCE_AUTHORITY_INVALID");
    requiredCorrections.push("Projection sourceAuthority must be FundTrackerAI.");
  }

  if (projection.destination !== "SoulBaseAI") {
    refusalReasons.push("DESTINATION_INVALID");
    requiredCorrections.push("Projection destination must be SoulBaseAI.");
  }

  const boundary = projection.boundary;

  const boundaryOk =
    boundary.projectionIsNotTransactionTruth === true &&
    boundary.projectionIsNotPaymentAuthority === true &&
    boundary.projectionIsNotCustodyTransfer === true &&
    boundary.projectionDoesNotContainRawProcessorObject === true &&
    boundary.projectionDoesNotContainRawBankStatement === true &&
    boundary.projectionDoesNotContainFullAccountNumber === true &&
    boundary.projectionDoesNotContainUnredactedPaymentMethod === true &&
    boundary.fundTrackerAIRemainsFinancialTruth === true &&
    boundary.soulBaseAIRemainsMemorySubstrate === true &&
    boundary.soulVaultRemainsCustodyPlane === true &&
    boundary.soulMemoryGovernsPersistence === true &&
    boundary.defaultPostureIsDeny === true;

  if (!boundaryOk) {
    refusalReasons.push("BOUNDARY_FLAG_INVALID");
    requiredCorrections.push("Projection boundary flags must preserve authority, custody, and raw-data refusal.");
  }

  return { refusalReasons, requiredCorrections };
}

function entryBody(entry: Omit<ProjectionLedgerEntry, "entryHash">) {
  return entry;
}

export async function createProjectionLedgerEntry(
  projection: FundTrackerAIToSoulBaseMemoryProjection,
  ledger: ProjectionLedgerEntry[]
): Promise<ProjectionLedgerEntry> {
  const sequence = ledger.length + 1;
  const prevHash = ledger.length === 0 ? GENESIS_HASH : ledger[ledger.length - 1]!.entryHash;
  const projectionHash = await hashCanonical(projection);

  const body = {
    entryId: `projection_ledger_entry_${sequence}_${projection.projectionId}`,
    sequence,
    projectionId: projection.projectionId,
    activatedTransactionStateId: projection.activatedTransactionStateId,
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection" as const,
    sourceAuthority: "FundTrackerAI" as const,
    destination: "SoulBaseAI" as const,
    downstreamConsumerId: projection.downstreamConsumerId,
    projectionHash,
    prevHash,
    createdAt: nowIso(),
    boundary: {
      entryIsNotPaymentAuthority: true as const,
      entryIsNotTransactionTruth: true as const,
      entryIsNotCustodyTransfer: true as const,
      entryIsTamperAware: true as const,
      replayRefusalRequired: true as const,
      fundTrackerAIRemainsTransactionTruth: true as const,
      soulBaseAIRemainsMemorySubstrate: true as const,
      soulVaultRemainsCustodyPlane: true as const
    }
  };

  const entryHash = await sha256Hex(canonicalize(entryBody(body)));

  return {
    ...body,
    entryHash
  };
}

export async function appendProjectionToLedger(
  projection: FundTrackerAIToSoulBaseMemoryProjection | undefined,
  ledger: ProjectionLedgerEntry[]
): Promise<ProjectionLedgerAppendDecision> {
  const shape = validateProjectionShape(projection);
  const refusalReasons: ProjectionRefusalCode[] = [...shape.refusalReasons];
  const requiredCorrections: string[] = [...shape.requiredCorrections];

  if (projection) {
    const duplicate = ledger.some((entry) => entry.projectionId === projection.projectionId);
    if (duplicate) {
      refusalReasons.push("DUPLICATE_PROJECTION_REFUSED");
      requiredCorrections.push("Do not append the same projection twice.");
    }
  }

  const uniqueRefusals = Array.from(new Set(refusalReasons));
  const uniqueCorrections = Array.from(new Set(requiredCorrections));

  if (uniqueRefusals.length > 0 || !projection) {
    return {
      status: "PROJECTION_LEDGER_ENTRY_REFUSED",
      accepted: false,
      refusalReasons: uniqueRefusals,
      requiredCorrections: uniqueCorrections,
      boundary: {
        paymentAuthorityNotCreated: true,
        custodyTransferNotCreated: true,
        duplicateProjectionRefused: uniqueRefusals.includes("DUPLICATE_PROJECTION_REFUSED"),
        tamperAwareLedgerMaintained: true
      }
    };
  }

  const entry = await createProjectionLedgerEntry(projection, ledger);

  return {
    status: "PROJECTION_LEDGER_ENTRY_ACCEPTED",
    accepted: true,
    entry,
    refusalReasons: [],
    requiredCorrections: [],
    boundary: {
      paymentAuthorityNotCreated: true,
      custodyTransferNotCreated: true,
      duplicateProjectionRefused: false,
      tamperAwareLedgerMaintained: true
    }
  };
}

export async function verifyProjectionLedger(
  ledger: ProjectionLedgerEntry[],
  projectionLookup: Record<string, FundTrackerAIToSoulBaseMemoryProjection>
): Promise<ProjectionLedgerVerificationResult> {
  const refusalReasons: ProjectionRefusalCode[] = [];

  if (ledger.length === 0) {
    return {
      status: "PROJECTION_LEDGER_VERIFIED",
      verified: true,
      refusalReasons: [],
      inspectedEntries: 0,
      lastValidHash: GENESIS_HASH
    };
  }

  const seen = new Set<string>();
  let previousHash = GENESIS_HASH;
  let lastValidHash = GENESIS_HASH;

  for (let index = 0; index < ledger.length; index++) {
    const entry = ledger[index]!;
    const expectedSequence = index + 1;

    if (entry.sequence !== expectedSequence) {
      refusalReasons.push("SEQUENCE_MISMATCH");
    }

    if (entry.prevHash !== previousHash) {
      refusalReasons.push("PREV_HASH_MISMATCH");
    }

    if (seen.has(entry.projectionId)) {
      refusalReasons.push("DUPLICATE_PROJECTION_REFUSED");
    }

    seen.add(entry.projectionId);

    const projection = projectionLookup[entry.projectionId];

    if (!projection) {
      refusalReasons.push("PROJECTION_MISSING");
    } else {
      const expectedProjectionHash = await hashCanonical(projection);
      if (entry.projectionHash !== expectedProjectionHash) {
        refusalReasons.push("PROJECTION_HASH_MISMATCH");
      }
    }

    const expectedEntryHash = await sha256Hex(
      canonicalize({
        entryId: entry.entryId,
        sequence: entry.sequence,
        projectionId: entry.projectionId,
        activatedTransactionStateId: entry.activatedTransactionStateId,
        artifactType: entry.artifactType,
        sourceAuthority: entry.sourceAuthority,
        destination: entry.destination,
        downstreamConsumerId: entry.downstreamConsumerId,
        projectionHash: entry.projectionHash,
        prevHash: entry.prevHash,
        createdAt: entry.createdAt,
        boundary: entry.boundary
      })
    );

    if (entry.entryHash !== expectedEntryHash) {
      refusalReasons.push("ENTRY_HASH_MISMATCH");
    }

    previousHash = entry.entryHash;
    lastValidHash = entry.entryHash;
  }

  const uniqueRefusals = Array.from(new Set(refusalReasons));
  const verified = uniqueRefusals.length === 0;

  return {
    status: verified ? "PROJECTION_LEDGER_VERIFIED" : "PROJECTION_LEDGER_TAMPER_DETECTED",
    verified,
    refusalReasons: uniqueRefusals,
    inspectedEntries: ledger.length,
    lastValidHash
  };
}



