import type {
  CheckpointMetrics,
  ProtectedChannelSnapshot,
  FlowCheckpointState,
  FlowDecision,
} from "./contracts.js";

export function computeSwellingScore(input: {
  checkpoint: CheckpointMetrics;
  protectedChannels: ProtectedChannelSnapshot[];
}): number {
  const c = input.checkpoint;

  const base =
    c.waitMinutes * 0.2 +
    c.retryCount * 8 +
    c.reopenCount * 10 +
    c.manualInterventionCount * 12 +
    c.blockedReleaseCount * 15 +
    c.downstreamConsequenceCount * 9 +
    c.costInflationDelta * 0.5 +
    c.channelDiscontinuityEvents * 18 +
    c.recoveryDepth * 6;

  const degradedChannels = input.protectedChannels.filter(
    (x) => x.state === "degraded" || x.state === "broken",
  ).length;

  return Math.round((base + degradedChannels * 14) * 100) / 100;
}

export function deriveCheckpointState(input: {
  swellingScore: number;
  protectedChannels: ProtectedChannelSnapshot[];
}): FlowCheckpointState {
  const broken = input.protectedChannels.some((x) => x.state === "broken");

  if (broken || input.swellingScore >= 85) return "blocked";
  if (input.swellingScore >= 55) return "swollen";
  if (input.swellingScore >= 25) return "watch";
  return "clear";
}

export function deriveFlowDecision(input: {
  checkpointState: FlowCheckpointState;
}): FlowDecision {
  switch (input.checkpointState) {
    case "blocked":
      return "FLOW_BLOCKED";
    case "swollen":
      return "FLOW_SWOLLEN";
    case "watch":
      return "FLOW_WATCH";
    case "released":
      return "FLOW_RELEASED";
    case "restored":
      return "FLOW_RESTORED";
    default:
      return "FLOW_HEALTHY";
  }
}