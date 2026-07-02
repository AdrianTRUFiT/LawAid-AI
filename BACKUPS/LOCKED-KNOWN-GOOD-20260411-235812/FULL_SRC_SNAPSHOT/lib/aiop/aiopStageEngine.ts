import { AiopSessionState, AiopStage } from "./aiopContracts";

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

export function getNextStage(current: AiopStage): AiopStage {
  const index = AIOP_STAGE_ORDER.indexOf(current);
  if (index < 0 || index >= AIOP_STAGE_ORDER.length - 1) {
    return "handoff";
  }
  return AIOP_STAGE_ORDER[index + 1];
}

export function canAdvanceStage(state: AiopSessionState): boolean {
  switch (state.currentStage) {
    case "entry":
      return Boolean(state.responses["pressure"]?.value);
    case "situation_snapshot":
      return true;
    case "reality_check":
      return Boolean(state.responses["risk"]?.value);
    case "context_capture":
      return true;
    case "identity_posture":
      return Boolean(state.responses["posture"]?.value);
    case "system_preview":
      return true;
    case "commitment_readiness":
      return true;
    case "handoff":
      return false;
    default:
      return false;
  }
}

export function getStageLabel(stage: AiopStage): string {
  switch (stage) {
    case "entry":
      return "Entry";
    case "situation_snapshot":
      return "Situation Snapshot";
    case "reality_check":
      return "Reality Check";
    case "context_capture":
      return "Context Capture";
    case "identity_posture":
      return "Identity + Posture";
    case "system_preview":
      return "System Preview";
    case "commitment_readiness":
      return "Commitment Readiness";
    case "handoff":
      return "Handoff";
    default:
      return stage;
  }
}

export function getStagePrompt(stage: AiopStage): string {
  switch (stage) {
    case "entry":
      return "What is putting the most pressure on you right now?";
    case "situation_snapshot":
      return "What broad situation are you in right now?";
    case "reality_check":
      return "What feels most exposed or at risk right now?";
    case "context_capture":
      return "What context should the system preserve?";
    case "identity_posture":
      return "How are you handling this right now?";
    case "system_preview":
      return "Here is the structured preview of what continuing would produce.";
    case "commitment_readiness":
      return "You now have something worth keeping.";
    case "handoff":
      return "Verified Opportunity emitted.";
    default:
      return "Continue.";
  }
}
