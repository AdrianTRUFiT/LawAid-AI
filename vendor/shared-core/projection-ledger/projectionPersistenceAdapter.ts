import type {
  DownstreamConsumerReadiness,
  ProjectionLedgerEntry,
  ProjectionPersistenceDecision,
  ProjectionPersistenceRequest
} from "./projectionLedgerContracts";
import { appendProjectionToLedger } from "./projectionLedgerEngine";

export function evaluateDownstreamConsumerReadiness(
  consumerId: string,
  projectionConsumerId: string
): DownstreamConsumerReadiness {
  const ready = consumerId === projectionConsumerId && consumerId === "SoulBaseAI";

  return {
    consumerId,
    ready,
    allowedToReadProjection: ready,
    allowedToReadRawSource: false,
    allowedToModifyLedger: false,
    allowedToCreateEntitlement: false,
    allowedToCreatePaymentAuthority: false,
    boundary: {
      displayIsNotAuthority: true,
      memoryIsNotTransactionTruth: true,
      ledgerIsTamperAwareRecordOnly: true
    }
  };
}

export async function persistProjectionForSoulBaseAI(
  request: ProjectionPersistenceRequest
): Promise<ProjectionPersistenceDecision> {
  const downstreamReadiness = evaluateDownstreamConsumerReadiness(
    request.downstreamConsumerId,
    request.projection.downstreamConsumerId
  );

  const ledgerDecision = await appendProjectionToLedger(request.projection, request.ledger);

  const persisted = ledgerDecision.accepted === true && downstreamReadiness.ready === true;
  const entry: ProjectionLedgerEntry | undefined = ledgerDecision.entry;

  return {
    status: persisted ? "PROJECTION_PERSISTENCE_ACCEPTED" : "PROJECTION_PERSISTENCE_REFUSED",
    persisted,
    record: persisted && entry
      ? {
          projectionId: request.projection.projectionId,
          ledgerEntryId: entry.entryId,
          projectionHash: entry.projectionHash,
          entryHash: entry.entryHash,
          destination: "SoulBaseAI",
          downstreamConsumerId: request.downstreamConsumerId,
          persistenceClass: "AUTHORIZED_MEMORY_PROJECTION"
        }
      : undefined,
    ledgerDecision,
    downstreamReadiness,
    boundary: {
      persistenceIsNotPaymentAuthority: true,
      persistenceIsNotTransactionTruth: true,
      persistenceIsNotCustodyTransfer: true,
      persistenceIsNotRuntimeActivation: true,
      sourceTruthRemainsFundTrackerAI: true,
      sourceCustodyRemainsSoulVault: true
    }
  };
}



