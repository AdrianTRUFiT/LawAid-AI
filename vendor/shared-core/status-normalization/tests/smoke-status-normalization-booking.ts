import { normalizeStatus } from "../src/index.js";

const result = normalizeStatus({
  sourceSystem: "logistics-booking-bridge",
  domain: "booking",
  rawStatus: "ready",
});

if (!result.ok || !result.output || result.output.canonicalStatus !== "BOOKING_READY") {
  throw new Error("Expected booking status normalization.");
}

console.log("SMOKE_STATUS_NORMALIZATION_BOOKING=PASS");