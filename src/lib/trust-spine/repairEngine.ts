import type { ArtifactEnvelope, RepairRecord, RepairType } from "./trustSpineContracts";
import { makeId, nowIso } from "./trustSpineUtils";

export function createRepairRecord(input: {
  artifactId: string;
  repairType: RepairType;
  reason: string;
  replacementArtifactId?: string;
  repairedArtifactId?: string;
}): RepairRecord {
  return {
    repairId: makeId("repair"),
    artifactId: input.artifactId,
    repairType: input.repairType,
    createdAt: nowIso(),
    reason: input.reason,
    replacementArtifactId: input.replacementArtifactId,
    repairedArtifactId: input.repairedArtifactId,
  };
}

export function markArtifactRepaired<TPayload>(
  envelope: ArtifactEnvelope<TPayload>,
  repairRecord: RepairRecord,
): ArtifactEnvelope<TPayload> {
  return {
    ...envelope,
    trustState: "repaired",
    quarantineState: "none",
    repairedFromArtifactId: repairRecord.artifactId,
    notes: [...(envelope.notes ?? []), `Repaired via ${repairRecord.repairType}`],
  };
}

export function markArtifactSuperseded<TPayload>(
  envelope: ArtifactEnvelope<TPayload>,
  supersedingArtifactId: string,
): ArtifactEnvelope<TPayload> {
  return {
    ...envelope,
    trustState: "superseded",
    quarantineState: "none",
    supersedesArtifactId: supersedingArtifactId,
    notes: [...(envelope.notes ?? []), `Superseded by ${supersedingArtifactId}`],
  };
}
