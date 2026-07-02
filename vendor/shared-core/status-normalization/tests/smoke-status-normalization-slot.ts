import { normalizeStatus } from "../src/index.js";

const result = normalizeStatus({
  sourceSystem: "slot-state-registry",
  domain: "slot",
  rawStatus: "available",
});

if (!result.ok || !result.output || result.output.canonicalStatus !== "OPEN") {
  throw new Error("Expected slot status normalization.");
}

console.log("SMOKE_STATUS_NORMALIZATION_SLOT=PASS");