import type { ExceptionEvent, ImpactPropagationRecord } from "./transportTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createExceptionEvent(input: {
  flowUnitId: string;
  sourceCheckpointId: string;
  exceptionType: ExceptionEvent["exceptionType"];
  severity: ExceptionEvent["severity"];
  message: string;
}): ExceptionEvent {
  return {
    eventId: makeId("exception"),
    flowUnitId: input.flowUnitId,
    sourceCheckpointId: input.sourceCheckpointId,
    exceptionType: input.exceptionType,
    severity: input.severity,
    message: input.message,
    createdAt: new Date().toISOString(),
  };
}

export function propagateImpact(input: {
  exceptionEvent: ExceptionEvent;
}): ImpactPropagationRecord {
  const effects: string[] = [];

  if (input.exceptionEvent.exceptionType === "missed_pickup") {
    effects.push("consolidation_miss");
    effects.push("lane_delay");
  }

  if (input.exceptionEvent.exceptionType === "consolidation_miss") {
    effects.push("lane_delay");
    effects.push("regional_receipt_shift");
  }

  if (input.exceptionEvent.exceptionType === "border_delay") {
    effects.push("delivery_window_risk");
    effects.push("cost_increase");
  }

  if (input.exceptionEvent.exceptionType === "delivery_miss") {
    effects.push("revenue_delay");
    effects.push("operator_stress");
  }

  if (input.exceptionEvent.exceptionType === "reroute_required") {
    effects.push("timing_variance");
    effects.push("handoff_change");
  }

  const throughputLossEstimate =
    input.exceptionEvent.severity === "critical"
      ? 0.8
      : input.exceptionEvent.severity === "high"
      ? 0.5
      : input.exceptionEvent.severity === "medium"
      ? 0.25
      : 0.1;

  return {
    recordId: makeId("impact"),
    flowUnitId: input.exceptionEvent.flowUnitId,
    rootEventId: input.exceptionEvent.eventId,
    downstreamEffects: effects,
    throughputLossEstimate,
    createdAt: new Date().toISOString(),
  };
}