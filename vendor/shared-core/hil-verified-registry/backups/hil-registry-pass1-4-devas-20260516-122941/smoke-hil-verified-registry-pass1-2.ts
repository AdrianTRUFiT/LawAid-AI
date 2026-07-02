import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(snapshot.registryId === "HIL_VERIFIED_MODULE_REGISTRY_PASS1_1", "Registry ID must remain Pass 1.1 lineage.");
assert(snapshot.records.length >= 7, "Expanded registry must keep seven records.");

const withHistory = snapshot.records.filter((record) => record.hasFalsePassHistory);
const clean = snapshot.records.filter((record) => record.verified && !record.hasFalsePassHistory);

assert(snapshot.verifiedCount >= 7, "All expanded records must remain verified.");
assert(snapshot.verifiedWithFalsePassHistoryCount === withHistory.length, "Verified-with-history count must match records.");
assert(snapshot.verifiedCleanCount === clean.length, "Verified-clean count must match records.");
assert(snapshot.falsePassCount >= 16, "False-pass count must remain visible.");
assert(snapshot.missingReportCount === 0, "No critical reports should be missing.");
assert(snapshot.allCriticalVerified === true, "All critical modules must remain verified.");

for (const record of withHistory) {
  assert(
    record.status === "VERIFIED_WITH_FALSE_PASS_HISTORY",
    `${record.moduleId} must use normalized verified-with-history status.`
  );
  assert(record.verified === true, `${record.moduleId} must remain verified.`);
}

for (const record of clean) {
  assert(record.status === "VERIFIED", `${record.moduleId} clean verified status required.`);
}

for (const record of snapshot.records) {
  assert(record.finalAction === "", `${record.moduleId} final action must remain blank.`);
  assert(record.humanFinalAuthority === true, `${record.moduleId} must preserve human authority.`);
}

console.log("HIL_VERIFIED_REGISTRY_PASS1_2_STATUS_NORMALIZATION_SMOKE=PASS");
console.log(JSON.stringify({
  status: "PASS",
  registryId: snapshot.registryId,
  verifiedCount: snapshot.verifiedCount,
  verifiedCleanCount: snapshot.verifiedCleanCount,
  verifiedWithFalsePassHistoryCount: snapshot.verifiedWithFalsePassHistoryCount,
  falsePassCount: snapshot.falsePassCount,
  missingReportCount: snapshot.missingReportCount,
  allCriticalVerified: snapshot.allCriticalVerified,
  records: snapshot.records.map((record) => ({
    moduleId: record.moduleId,
    status: record.status,
    verified: record.verified,
    hasFalsePassHistory: record.hasFalsePassHistory,
    latestVerifiedReport: record.latestVerifiedReport
  })),
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));