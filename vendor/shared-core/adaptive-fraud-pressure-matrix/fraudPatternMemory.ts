import type { FraudAttackVector } from "../fraudai-adversarial-harness";
import type {
  FraudAttackObservation,
  FraudAttackPatternMemory
} from "./adaptiveFraudPressureContracts";

function uniqueCount(values: Array<string | undefined>): number {
  return new Set(values.filter((value): value is string => typeof value === "string" && value.length > 0)).size;
}

export function buildFraudAttackPatternMemory(
  observations: FraudAttackObservation[]
): FraudAttackPatternMemory[] {
  const byVector = new Map<FraudAttackVector, FraudAttackObservation[]>();

  for (const observation of observations) {
    const existing = byVector.get(observation.vector) ?? [];
    existing.push(observation);
    byVector.set(observation.vector, existing);
  }

  return Array.from(byVector.entries()).map(([vector, vectorObservations]) => {
    const sorted = [...vectorObservations].sort((a, b) =>
      a.attemptedAt.localeCompare(b.attemptedAt)
    );

    const mutationFamilies = Array.from(
      new Set(
        vectorObservations
          .map((observation) => observation.mutationFamily)
          .filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    );

    return {
      vector,
      totalAttempts: vectorObservations.length,
      refusedOrDetectedAttempts: vectorObservations.filter(
        (observation) => observation.refused || observation.detected
      ).length,
      escapedAttempts: vectorObservations.filter(
        (observation) => !observation.refused && !observation.detected
      ).length,
      firstSeenAt: sorted[0]?.attemptedAt ?? "",
      lastSeenAt: sorted[sorted.length - 1]?.attemptedAt ?? "",
      uniqueActorFingerprints: uniqueCount(vectorObservations.map((observation) => observation.actorFingerprint)),
      uniqueSessionFingerprints: uniqueCount(vectorObservations.map((observation) => observation.sessionFingerprint)),
      mutationFamilies
    };
  });
}

export function getPatternForVector(
  memory: FraudAttackPatternMemory[],
  vector: FraudAttackVector
): FraudAttackPatternMemory | undefined {
  return memory.find((pattern) => pattern.vector === vector);
}

