import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-4.json");

assert(fs.existsSync(packetPath), "Pass 4 packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_4_RECORDING_READINESS_SEALED", "Pass 4 recording readiness is sealed");
assert(packet.recordingReadinessOnly === true, "Pass 4 is recording-readiness only");
assert(packet.counts.failed === 0, "No failed findings");
assert(packet.boundary.recordingReadinessIsNotRuntime === true, "Recording readiness is not runtime");
assert(packet.boundary.recordingReadinessIsNotActivation === true, "Recording readiness is not activation");
assert(packet.boundary.recordingReadinessIsNotDeployment === true, "Recording readiness is not deployment");
assert(packet.boundary.recordingReadinessDoesNotCreateActivatedTransactionState === true, "Recording readiness does not create Activated Transaction State");
assert(packet.boundary.recordingReadinessDoesNotCreateLawAidAIUnlock === true, "Recording readiness does not create LawAidAI unlock");
assert(packet.boundary.recordingReadinessDoesNotCertifyEvidence === true, "Recording readiness does not certify evidence");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");

const requiredAssets = packet.assetRecords;
assert(requiredAssets.length === 3, "Three required assets tracked");
for (const asset of requiredAssets) {
  assert(asset.exists === true, `${asset.file} exists`);
  assert(asset.sizeBytes > 0, `${asset.file} is non-empty`);
  assert(typeof asset.sha256 === "string" && asset.sha256.length > 0, `${asset.file} hash exists`);
}

assert(fs.existsSync(packet.finalSealFiles.checklist), "Recording checklist exists");
assert(fs.existsSync(packet.finalSealFiles.seal), "Recording seal exists");
assert(fs.existsSync(packet.finalSealFiles.guide), "Recording guide exists");
assert(fs.existsSync(packet.finalSealFiles.reviewHtml), "Recording review HTML exists");

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_4_SMOKE=PASS");









