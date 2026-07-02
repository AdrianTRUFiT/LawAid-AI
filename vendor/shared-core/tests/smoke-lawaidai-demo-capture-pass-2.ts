import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-2.json");

assert(fs.existsSync(packetPath), "Pass 2 packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_2_SCREENSHOT_PACKAGE_CLOSED", "Pass 2 screenshot package is closed");
assert(packet.captureValidationOnly === true, "Pass 2 is capture-validation only");
assert(packet.boundary.screenshotIntakeIsNotRuntime === true, "Screenshot intake is not runtime");
assert(packet.boundary.screenshotIntakeIsNotActivation === true, "Screenshot intake is not activation");
assert(packet.boundary.screenshotIntakeIsNotDeployment === true, "Screenshot intake is not deployment");
assert(packet.boundary.screenshotIntakeDoesNotCreateActivatedTransactionState === true, "Screenshot intake does not create Activated Transaction State");
assert(packet.boundary.screenshotIntakeDoesNotCreateLawAidAIUnlock === true, "Screenshot intake does not create LawAidAI unlock");
assert(packet.boundary.screenshotsAreReviewEvidenceOnly === true, "Screenshots are review evidence only");
assert(packet.counts.failed === 0, "No failed findings");
assert(packet.screenshotRecords.length >= 3, "Screenshot records exist");

const requiredShots = packet.screenshotRecords.filter((s: any) => s.required === true);
assert(requiredShots.length >= 3, "At least three required screenshots are tracked");

for (const shot of requiredShots) {
  assert(shot.exists === true, `${shot.expectedFile} exists`);
  assert(shot.sizeBytes > 0, `${shot.expectedFile} is non-empty`);
  assert(typeof shot.sha256 === "string" && shot.sha256.length > 0, `${shot.expectedFile} hash exists`);
}

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_2_SMOKE=PASS");









