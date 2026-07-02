import { normalizeStatus } from "../src/index.js";

const result = normalizeStatus({
  sourceSystem: "any-system",
  domain: "generic",
  rawStatus: "   ",
});

if (result.ok || result.refusal?.refusalCode !== "EMPTY_STATUS") {
  throw new Error("Expected empty status refusal.");
}

console.log("SMOKE_STATUS_NORMALIZATION_EMPTY=PASS");