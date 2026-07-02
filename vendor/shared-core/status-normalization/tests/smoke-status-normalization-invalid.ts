import { normalizeStatus } from "../src/index.js";

const result = normalizeStatus({
  sourceSystem: "unknown-system",
  domain: "slot",
  rawStatus: "teleporting",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_STATUS") {
  throw new Error("Expected invalid status refusal.");
}

console.log("SMOKE_STATUS_NORMALIZATION_INVALID=PASS");