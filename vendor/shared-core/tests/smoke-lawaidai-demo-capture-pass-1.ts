import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-1.json");
const screenshotManifestPath = path.join(captureRoot, "lawaidai-demo-capture-screenshot-manifest.json");
const evidenceRoot = path.join(captureRoot, "evidence");
const reportsRoot = path.join(captureRoot, "reports");
const screenshotsRoot = path.join(captureRoot, "screenshots");

assert(fs.existsSync(packetPath), "Demo capture packet exists");
assert(fs.existsSync(screenshotManifestPath), "Screenshot manifest exists");
assert(fs.existsSync(evidenceRoot), "Evidence folder exists");
assert(fs.existsSync(reportsRoot), "Reports folder exists");
assert(fs.existsSync(screenshotsRoot), "Screenshots folder exists");

const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));
const screenshotManifest = JSON.parse(fs.readFileSync(screenshotManifestPath, "utf8"));

assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_1_EVIDENCE_PACKAGE_READY", "Demo capture package is ready");
assert(packet.captureOnly === true, "Demo capture is capture-only");
assert(packet.boundary.demoCaptureIsNotRuntime === true, "Demo capture is not runtime");
assert(packet.boundary.demoCaptureIsNotActivation === true, "Demo capture is not activation");
assert(packet.boundary.demoCaptureIsNotDeployment === true, "Demo capture is not deployment");
assert(packet.boundary.demoCaptureIsNotPaymentAuthority === true, "Demo capture is not payment authority");
assert(packet.boundary.demoCaptureDoesNotCreateActivatedTransactionState === true, "Demo capture does not create Activated Transaction State");
assert(packet.boundary.demoCaptureDoesNotCreateLawAidAIUnlock === true, "Demo capture does not create LawAidAI unlock");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");

assert(screenshotManifest.status === "SCREENSHOT_MANIFEST_READY", "Screenshot manifest is ready");
assert(screenshotManifest.boundary.screenshotsAreReviewEvidenceOnly === true, "Screenshots are review evidence only");
assert(screenshotManifest.requiredScreenshots.length >= 3, "Required screenshots are listed");

const requiredEvidence = [
  "pass-7-final-closure.json",
  "pass-7-final-closure-packet.json",
  "pass-6-fundtracker-activation-readiness.json",
  "pass-6-readiness-packet.json"
];

for (const file of requiredEvidence) {
  assert(fs.existsSync(path.join(evidenceRoot, file)), `${file} copied into evidence folder`);
}

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_1_SMOKE=PASS");









