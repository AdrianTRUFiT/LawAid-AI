import type {
  CheckpointMetrics,
  FlowHealthSnapshot,
  ProtectedChannelSnapshot,
  ProtectedFlowResult,
} from "./contracts.js";
import { computeSwellingScore, deriveCheckpointState, deriveFlowDecision } from "./scoring.js";
import { buildFeeEvents } from "./feeEvents.js";
import { buildRestorationPlan } from "./restoration.js";

function computeHealthyCost(checkpoint: CheckpointMetrics): number {
  return Math.round(
    (
      checkpoint.waitMinutes * 0.01 +
      checkpoint.manualInterventionCount * 0.08 +
      checkpoint.blockedReleaseCount * 0.05
    ) * 100
  ) / 100;
}

function computeInflammatoryCost(checkpoint: CheckpointMetrics): number {
  return Math.round(
    (
      checkpoint.retryCount * 0.09 +
      checkpoint.reopenCount * 0.11 +
      checkpoint.channelDiscontinuityEvents * 0.15 +
      checkpoint.costInflationDelta * 0.02
    ) * 100
  ) / 100;
}

export function evaluateProtectedFlow(input: {
  flowId: string;
  checkpoint: CheckpointMetrics;
  protectedChannels: ProtectedChannelSnapshot[];
}): ProtectedFlowResult {
  const swellingScore = computeSwellingScore({
    checkpoint: input.checkpoint,
    protectedChannels: input.protectedChannels,
  });

  const checkpointState = deriveCheckpointState({
    swellingScore,
    protectedChannels: input.protectedChannels,
  });

  const decision = deriveFlowDecision({
    checkpointState,
  });

  const snapshot: FlowHealthSnapshot = {
    flowId: input.flowId,
    checkpoint: input.checkpoint,
    protectedChannels: input.protectedChannels,
    checkpointState,
    decision,
    swellingScore,
    protectedFlowHealthy: checkpointState === "clear",
    healthyCost: computeHealthyCost(input.checkpoint),
    inflammatoryCost: computeInflammatoryCost(input.checkpoint),
    generatedAt: new Date().toISOString(),
  };

  return {
    snapshot,
    feeEvents: buildFeeEvents(snapshot),
    restorationPlan: buildRestorationPlan(snapshot),
  };
}