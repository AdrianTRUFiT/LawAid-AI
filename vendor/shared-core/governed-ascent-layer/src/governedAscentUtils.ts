import type { AscentStage, PressureClass } from "./governedAscentTypes.js";

const STAGE_ORDER: AscentStage[] = [
  "GROUND_ZERO",
  "LAYER_1",
  "LAYER_2",
  "LAYER_3",
  "LAYER_4",
  "LAYER_5",
  "LAYER_6",
  "SUMMIT",
];

const STAGE_WEIGHTS: Record<AscentStage, number> = {
  GROUND_ZERO: 0,
  LAYER_1: 1,
  LAYER_2: 2,
  LAYER_3: 3,
  LAYER_4: 4,
  LAYER_5: 5,
  LAYER_6: 6,
  SUMMIT: 7,
};

export function nowIso(): string {
  return new Date().toISOString();
}

export function getStageIndex(stage: AscentStage): number {
  return STAGE_ORDER.indexOf(stage);
}

export function getStageWeight(stage: AscentStage): number {
  return STAGE_WEIGHTS[stage];
}

export function isLegalProgression(currentStage: AscentStage, targetStage: AscentStage): boolean {
  const currentIndex = getStageIndex(currentStage);
  const targetIndex = getStageIndex(targetStage);

  if (currentIndex < 0 || targetIndex < 0) {
    return false;
  }

  return targetIndex - currentIndex === 1;
}

export function totalPressureScore(
  pressureProfile: Record<PressureClass, number>,
): number {
  return (
    pressureProfile.time +
    pressureProfile.money +
    pressureProfile.consumption +
    pressureProfile.logistics +
    pressureProfile.layers
  ) / 5;
}

export function dominantPressure(
  pressureProfile: Record<PressureClass, number>,
): PressureClass {
  const entries = Object.entries(pressureProfile) as [PressureClass, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}