import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(snapshot.registryId === "HIL_VERIFIED_MODULE_REGISTRY_PASS1_4", "Registry ID must be Pass 1.4.");
assert(snapshot.records.length >= 8, "Registry must include DEVAS plus prior verified chain.");

const devas = snapshot.records.find((record) => record.moduleId === "DEVAS_PASS1");
assert(devas, "DEVAS_PASS1 record required.");
assert(devas?.verified === true, "DEVAS_PASS1 must be verified.");
assert(devas?.status === "VERIFIED", "DEVAS_PASS1 should be clean verified unless false-pass reports exist.");
assert(devas?.latestVerifiedReport?.includes("devas-pass1-verified-20260516-122717.md"), "DEVAS latest verified report mismatch.");
assert(devas?.moduleClass === "DEAL_VALUE_ASSESSMENT", "DEVAS module class mismatch.");
assert(devas?.modulePath.endsWith("armanis\\devas") || devas?.modulePath.endsWith("armanis/devas"), "DEVAS path mismatch.");
assert(devas?.boundaries.includes("Inside ARMANIS"), "DEVAS must remain inside ARMANIS.");
assert(devas?.boundaries.includes("No finance model"), "DEVAS finance boundary required.");
assert(devas?.boundaries.includes("No final deal authority"), "DEVAS final authority boundary required.");
assert(devas?.humanFinalAuthority === true, "DEVAS human authority required.");
assert(devas?.finalAction === "", "DEVAS final action must remain blank.");

const required = [
  "ARMANIS_PASS1",
  "DEVAS_PASS1",
  "NEIL_PASS1",
  "NEIL_PASS1_1",
  "HIL_REGISTRY_PASS1",
  "PAI_OFF_PASS1",
  "SLIM_WORKSPACE_V0",
  "AIM_V01_V02_CHAIN"
];

for (const moduleId of required) {
  const record = snapshot.records.find((item) => item.moduleId === moduleId);
  assert(record, `${moduleId} record required.`);
  assert(record?.verified === true, `${moduleId} must remain verified.`);
  assert(record?.humanFinalAuthority === true, `${moduleId} must preserve human authority.`);
  assert(record?.finalAction === "", `${moduleId} final action must remain blank.`);
}

assert(snapshot.verifiedCount >= 8, "Verified count must now include DEVAS.");
assert(snapshot.missingReportCount === 0, "Missing report count must remain zero.");
assert(snapshot.allCriticalVerified === true, "All critical modules must remain verified.");
assert(snapshot.humanFinalAuthority === true, "Human final authority required.");
assert(snapshot.finalAction === "", "Final action must remain blank.");

console.log("HIL_VERIFIED_REGISTRY_PASS1_4_DEVAS_REGISTRATION_SMOKE=PASS");
console.log(JSON.stringify({
  status: "PASS",
  registryId: snapshot.registryId,
  verifiedCount: snapshot.verifiedCount,
  verifiedCleanCount: snapshot.verifiedCleanCount,
  verifiedWithFalsePassHistoryCount: snapshot.verifiedWithFalsePassHistoryCount,
  falsePassCount: snapshot.falsePassCount,
  missingReportCount: snapshot.missingReportCount,
  allCriticalVerified: snapshot.allCriticalVerified,
  devas: {
    moduleId: devas?.moduleId,
    status: devas?.status,
    latestVerifiedReport: devas?.latestVerifiedReport,
    nextAction: devas?.nextAction
  },
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));