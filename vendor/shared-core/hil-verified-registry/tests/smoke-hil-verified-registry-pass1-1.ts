import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(
  [
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_1",
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_4"
  ].includes(snapshot.registryId),
  "Registry ID must be Pass 1.1 or later."
);

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
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));