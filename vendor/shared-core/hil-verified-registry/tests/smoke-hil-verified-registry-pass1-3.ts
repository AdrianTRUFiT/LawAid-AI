import fs from "node:fs";
import path from "node:path";
import {
  defaultAivaHilRegistry,
  exportHilRegistrySnapshot
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const timestamp = "20260516-123000";
const outputRoot = path.join(process.cwd(), "exports");
const snapshot = defaultAivaHilRegistry();

const result = exportHilRegistrySnapshot({
  snapshot,
  outputRoot,
  timestamp
});

assert(fs.existsSync(result.jsonPath), "JSON snapshot must exist.");
assert(fs.existsSync(result.markdownPath), "Markdown snapshot must exist.");
assert(fs.existsSync(result.kbUpdatePath), "KB update must exist.");

const json = JSON.parse(fs.readFileSync(result.jsonPath, "utf8"));
const markdown = fs.readFileSync(result.markdownPath, "utf8");
const kb = fs.readFileSync(result.kbUpdatePath, "utf8");

assert(
  [
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_1",
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_4"
  ].includes(json.registryId),
  "JSON registry ID must persist through registry evolution."
);

assert(markdown.includes("HIL Verified Registry Snapshot"), "Markdown snapshot title required.");
assert(kb.includes("KB UPDATE — HIL Verified Registry Pass 1.3 Export Lock"), "KB update title required.");

assert(result.verifiedCount >= 7, "Verified count must remain >= 7.");
assert(result.verifiedWithFalsePassHistoryCount >= 6, "Verified-with-history count must remain >= 6.");
assert(result.falsePassCount >= 16, "False-pass count must remain visible.");
assert(result.missingReportCount === 0, "Missing report count must remain zero.");
assert(result.allCriticalVerified === true, "All critical modules must remain verified.");
assert(result.humanFinalAuthority === true, "Human final authority must remain true.");
assert(result.finalAction === "", "Final action must remain blank.");

console.log("HIL_VERIFIED_REGISTRY_PASS1_3_EXPORT_SMOKE=PASS");
console.log(JSON.stringify({
  status: "PASS",
  exportId: result.exportId,
  jsonPath: result.jsonPath,
  markdownPath: result.markdownPath,
  kbUpdatePath: result.kbUpdatePath,
  verifiedCount: result.verifiedCount,
  verifiedCleanCount: result.verifiedCleanCount,
  verifiedWithFalsePassHistoryCount: result.verifiedWithFalsePassHistoryCount,
  falsePassCount: result.falsePassCount,
  missingReportCount: result.missingReportCount,
  allCriticalVerified: result.allCriticalVerified,
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));