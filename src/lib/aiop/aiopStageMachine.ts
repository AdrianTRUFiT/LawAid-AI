import type { AiopSessionState, AiopStage } from "./aiopContracts";
import { getNextStage, getStagePrompt } from "./aiopStageEngine";

export const AIOP_STAGE_ORDER: AiopStage[] = [
  "entry",
  "situation_snapshot",
  "reality_check",
  "context_capture",
  "identity_posture",
  "system_preview",
  "commitment_readiness",
  "handoff",
];

export function getNextOnboardingStage(
  current: AiopStage,
): AiopStage {
  return getNextStage(current);
}

export function getLegacyStagePrompt(
  session: AiopSessionState,
): string {
  return getStagePrompt(session.currentStage);
}
