import { createExceptionEvent, propagateImpact } from "../src/index.js";

const event = createExceptionEvent({
  flowUnitId: "flow_exception_001",
  sourceCheckpointId: "cp_border_delay",
  exceptionType: "border_delay",
  severity: "high",
  message: "Border clearance missed expected window.",
});

const impact = propagateImpact({
  exceptionEvent: event,
});

if (impact.downstreamEffects.length === 0) {
  throw new Error("Expected downstream effects.");
}

if (impact.throughputLossEstimate <= 0) {
  throw new Error("Expected positive throughput loss estimate.");
}

console.log("SMOKE_TRANSPORT_EXCEPTION_CHAIN=PASS");