import {
  defaultAivaHilRegistry
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const snapshot = defaultAivaHilRegistry();

assert(
  [
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1",
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_1",
    "HIL_VERIFIED_MODULE_REGISTRY_PASS1_4"
  ].includes(snapshot.registryId),
  "Registry ID must be correct."
);

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

assert(snapshot.verifiedCount >= 3, "At least three critical records must be verified.");
assert(snapshot.falsePassCount >= 3, "False-pass history must be visible.");
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
  finalAuthority: "Human",
  finalAction: ""
}, null, 2));