import type {
  FeeEvent,
  FeeEventType,
  FlowHealthSnapshot,
} from "./contracts.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function pushFee(
  target: FeeEvent[],
  flowId: string,
  checkpointId: string,
  feeType: FeeEventType,
  amount: number,
  compensable: boolean,
  rationale: string,
): void {
  target.push({
    feeEventId: makeId("fee"),
    flowId,
    checkpointId,
    feeType,
    amount,
    compensable,
    rationale,
    createdAt: new Date().toISOString(),
  });
}

export function buildFeeEvents(snapshot: FlowHealthSnapshot): FeeEvent[] {
  const events: FeeEvent[] = [];
  const checkpointId = snapshot.checkpoint.checkpointId;

  pushFee(
    events,
    snapshot.flowId,
    checkpointId,
    "monitoring_fee",
    0.05,
    true,
    "Protected checkpoint monitoring occurred.",
  );

  if (snapshot.checkpoint.retryCount > 0 || snapshot.checkpoint.reopenCount > 0) {
    pushFee(
      events,
      snapshot.flowId,
      checkpointId,
      "intervention_fee",
      0.07,
      true,
      "Operator or system intervention was required.",
    );
  }

  if (snapshot.checkpointState === "blocked") {
    pushFee(
      events,
      snapshot.flowId,
      checkpointId,
      "routing_fee",
      0,
      false,
      "Checkpoint blocked; no healthy movement compensation allowed.",
    );
  } else {
    pushFee(
      events,
      snapshot.flowId,
      checkpointId,
      "routing_fee",
      0.03,
      true,
      "Protected routing preserved movement.",
    );
  }

  if (snapshot.checkpoint.blockedReleaseCount > 0) {
    pushFee(
      events,
      snapshot.flowId,
      checkpointId,
      "release_fee",
      0.04,
      true,
      "Release gating and guarded continuation occurred.",
    );
  }

  if (snapshot.checkpointState === "clear") {
    pushFee(
      events,
      snapshot.flowId,
      checkpointId,
      "continuity_proof_fee",
      0.02,
      true,
      "Continuity remained healthy through checkpoint passage.",
    );
  }

  return events;
}