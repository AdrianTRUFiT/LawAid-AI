import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(snapshot.registryId === "HIL_VERIFIED_MODULE_REGISTRY_PASS1_5", "Registry ID must be Pass 1.5.");
assert(snapshot.records.length >= 9, "Registry must include VUEⓈ plus prior verified chain.");

const vue = snapshot.records.find((record) => record.moduleId === "VUE_PASS1");
assert(vue, "VUE_PASS1 record required.");
assert(vue?.verified === true, "VUE_PASS1 must be verified.");
assert(vue?.status === "VERIFIED_WITH_FALSE_PASS_HISTORY", "VUE_PASS1 must preserve false-pass history.");
assert(vue?.latestVerifiedReport?.includes("vue-pass1-verified-20260516-160543.md"), "VUE latest verified report mismatch.");
assert(vue?.moduleClass === "VERIFIED_EXPERIENCE_RAIL", "VUE module class mismatch.");
assert(vue?.modulePath.endsWith("src\\lib\\vue") || vue?.modulePath.endsWith("src/lib/vue"), "VUE path mismatch.");
assert(vue?.boundaries.includes("No ticketing execution"), "VUE ticketing boundary required.");
assert(vue?.boundaries.includes("No payment execution"), "VUE payment boundary required.");
assert(vue?.boundaries.includes("No settlement execution"), "VUE settlement boundary required.");
assert(vue?.boundaries.includes("No external APIs"), "VUE external API boundary required.");
assert(vue?.boundaries.includes("No rights claims"), "VUE rights boundary required.");
assert(vue?.humanFinalAuthority === true, "VUE human authority required.");
assert(vue?.finalAction === "", "VUE final action must remain blank.");

const required = [
  "ARMANIS_PASS1",
  "DEVAS_PASS1",
  "NEIL_PASS1",
  "NEIL_PASS1_1",
  "HIL_REGISTRY_PASS1",
  "PAI_OFF_PASS1",
  "VUE_PASS1",
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

assert(snapshot.verifiedCount >= 9, "Verified count must now include VUEⓈ.");
assert(snapshot.falsePassCount >= 20, "False-pass count must include VUEⓈ false-pass history.");
assert(snapshot.missingReportCount === 0, "Missing report count must remain zero.");
assert(snapshot.allCriticalVerified === true, "All critical modules must remain verified.");
assert(snapshot.humanFinalAuthority === true, "Human final authority required.");
assert(snapshot.finalAction === "", "Final action must remain blank.");

console.log("HIL_VERIFIED_REGISTRY_PASS1_5_VUE_REGISTRATION_SMOKE=PASS");
console.log(JSON.stringify({
  status: "PASS",
  registryId: snapshot.registryId,
  verifiedCount: snapshot.verifiedCount,
  verifiedCleanCount: snapshot.verifiedCleanCount,
  verifiedWithFalsePassHistoryCount: snapshot.verifiedWithFalsePassHistoryCount,
  falsePassCount: snapshot.falsePassCount,
  missingReportCount: snapshot.missingReportCount,
  allCriticalVerified: snapshot.allCriticalVerified,
  vue: {
    moduleId: vue?.moduleId,
    status: vue?.status,
    latestVerifiedReport: vue?.latestVerifiedReport,
    nextAction: vue?.nextAction
  },
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));