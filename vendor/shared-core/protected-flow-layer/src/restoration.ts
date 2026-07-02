import type {
  FlowHealthSnapshot,
  RestorationPlan,
} from "./contracts.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildRestorationPlan(
  snapshot: FlowHealthSnapshot,
): RestorationPlan | null {
  if (snapshot.checkpointState === "clear") {
    return null;
  }

  const requiredActions: string[] = [];

  if (snapshot.checkpoint.retryCount > 0) {
    requiredActions.push("Reduce retry loop and clarify checkpoint contract.");
  }

  if (snapshot.checkpoint.manualInterventionCount > 0) {
    requiredActions.push("Document intervention cause and convert to bounded rule where possible.");
  }

  if (snapshot.checkpoint.channelDiscontinuityEvents > 0) {
    requiredActions.push("Repair authority-channel continuity before protected release.");
  }

  if (snapshot.checkpoint.blockedReleaseCount > 0) {
    requiredActions.push("Resolve blocked-release condition and re-evaluate downstream readiness.");
  }

  if (snapshot.checkpoint.costInflationDelta > 0) {
    requiredActions.push("Separate healthy cost from inflammatory cost and remove drag-added work.");
  }

  const brokenChannelExists = snapshot.protectedChannels.some(
    (x) => x.state === "broken",
  );

  return {
    restorationId: makeId("restore"),
    flowId: snapshot.flowId,
    checkpointId: snapshot.checkpoint.checkpointId,
    requiredActions,
    releaseReady: !brokenChannelExists && snapshot.checkpointState !== "blocked",
    restoreReady: requiredActions.length > 0,
    createdAt: new Date().toISOString(),
  };
}