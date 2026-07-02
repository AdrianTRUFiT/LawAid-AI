import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(snapshot.registryId === "HIL_VERIFIED_MODULE_REGISTRY_PASS1", "Registry ID must be correct.");
assert(snapshot.records.length >= 3, "Registry must include ARMANIS and NEIL records.");

const armanis = snapshot.records.find((record) => record.moduleId === "ARMANIS_PASS1");
const neil = snapshot.records.find((record) => record.moduleId === "NEIL_PASS1");
const neil11 = snapshot.records.find((record) => record.moduleId === "NEIL_PASS1_1");

assert(armanis, "ARMANIS Pass 1 record required.");
assert(neil, "NEIL Pass 1 record required.");
assert(neil11, "NEIL Pass 1.1 record required.");

assert(armanis?.verified === true, "ARMANIS Pass 1 must be verified.");
assert(neil?.verified === true, "NEIL Pass 1 must be verified.");
assert(neil11?.verified === true, "NEIL Pass 1.1 must be verified.");

assert(armanis?.latestVerifiedReport?.endsWith("armanis-pass1-verified-20260516-110318.md"), "ARMANIS latest report mismatch.");
assert(neil?.latestVerifiedReport?.endsWith("neil-pass1-verified-20260516-111204.md"), "NEIL Pass 1 latest report mismatch.");
assert(neil11?.latestVerifiedReport?.endsWith("neil-pass1-1-verified-20260516-111746.md"), "NEIL Pass 1.1 latest report mismatch.");

assert(snapshot.verifiedCount >= 3, "At least three critical records must be verified.");
assert(snapshot.falsePassCount >= 3, "False-pass history must be visible.");
assert(snapshot.allCriticalVerified === true, "All critical registry records must be verified.");
assert(snapshot.humanFinalAuthority === true, "Human final authority required.");
assert(snapshot.finalAction === "", "Final action must remain blank.");

for (const record of snapshot.records) {
  assert(record.finalAction === "", `${record.moduleId} final action must remain blank.`);
  assert(record.humanFinalAuthority === true, `${record.moduleId} must preserve human authority.`);
}

console.log("HIL_VERIFIED_REGISTRY_PASS1_SMOKE=PASS");
console.log(JSON.stringify({
  status: "PASS",
  registryId: snapshot.registryId,
  verifiedCount: snapshot.verifiedCount,
  falsePassCount: snapshot.falsePassCount,
  missingReportCount: snapshot.missingReportCount,
  allCriticalVerified: snapshot.allCriticalVerified,
  records: snapshot.records.map((record) => ({
    moduleId: record.moduleId,
    status: record.status,
    verified: record.verified,
    latestVerifiedReport: record.latestVerifiedReport,
    nextAction: record.nextAction
  })),
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));