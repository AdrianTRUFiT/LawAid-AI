import { normalizeStatus } from "../src/index.js";

const result = normalizeStatus({
  sourceSystem: "agreement-sealing-bridge",
  domain: "agreement",
  rawStatus: "confirmed",
});

if (!result.ok || !result.output || result.output.canonicalStatus !== "SEALED") {
  throw new Error("Expected agreement status normalization.");
}

console.log("SMOKE_STATUS_NORMALIZATION_AGREEMENT=PASS");