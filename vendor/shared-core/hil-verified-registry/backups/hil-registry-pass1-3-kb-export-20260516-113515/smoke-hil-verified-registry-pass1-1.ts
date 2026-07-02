import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(snapshot.registryId === "HIL_VERIFIED_MODULE_REGISTRY_PASS1_1", "Registry ID must be Pass 1.1.");
assert(snapshot.records.length >= 7, "Registry must include ARMANIS, NEIL, HIL, PAI-OFF, SLiM, and AIM records.");

const required = [
  "ARMANIS_PASS1",
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
  assert(record?.humanFinalAuthority === true, `${moduleId} must preserve human authority.`);
  assert(record?.finalAction === "", `${moduleId} final action must remain blank.`);
}

const armanis = snapshot.records.find((record) => record.moduleId === "ARMANIS_PASS1");
const neil = snapshot.records.find((record) => record.moduleId === "NEIL_PASS1");
const neil11 = snapshot.records.find((record) => record.moduleId === "NEIL_PASS1_1");
const hil = snapshot.records.find((record) => record.moduleId === "HIL_REGISTRY_PASS1");
const paiOff = snapshot.records.find((record) => record.moduleId === "PAI_OFF_PASS1");
const slim = snapshot.records.find((record) => record.moduleId === "SLIM_WORKSPACE_V0");
const aim = snapshot.records.find((record) => record.moduleId === "AIM_V01_V02_CHAIN");

assert(armanis?.verified === true, "ARMANIS Pass 1 must remain verified.");
assert(neil?.verified === true, "NEIL Pass 1 must remain verified.");
assert(neil11?.verified === true, "NEIL Pass 1.1 must remain verified.");
assert(hil?.verified === true, "HIL Registry Pass 1 must remain verified.");

assert(slim?.expectedVerifiedReports.length !== undefined, "SLiM expected reports array must exist.");
assert(aim?.expectedVerifiedReports.length !== undefined, "AIM expected reports array must exist.");
assert(paiOff?.expectedVerifiedReports.length !== undefined, "PAI-OFF expected reports array must exist.");

assert(snapshot.falsePassCount >= 3, "False-pass history must remain visible.");
assert(snapshot.humanFinalAuthority === true, "Human final authority required.");
assert(snapshot.finalAction === "", "Final action must remain blank.");

console.log("HIL_VERIFIED_REGISTRY_PASS1_1_SMOKE=PASS");
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
    reportCount: record.expectedVerifiedReports.length,
    falsePassCount: record.knownFalsePassReports.length,
    nextAction: record.nextAction
  })),
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));