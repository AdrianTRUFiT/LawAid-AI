import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-3.json");

assert(fs.existsSync(packetPath), "Pass 3 packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_3_DEMO_RECORDING_PACKAGE_READY", "Pass 3 demo recording package is ready");
assert(packet.demoPackageOnly === true, "Pass 3 is demo-package only");
assert(packet.counts.failed === 0, "No failed findings");
assert(packet.boundary.demoPackageIsNotRuntime === true, "Demo package is not runtime");
assert(packet.boundary.demoPackageIsNotActivation === true, "Demo package is not activation");
assert(packet.boundary.demoPackageIsNotDeployment === true, "Demo package is not deployment");
assert(packet.boundary.demoPackageDoesNotCreateActivatedTransactionState === true, "Demo package does not create Activated Transaction State");
assert(packet.boundary.demoPackageDoesNotCreateLawAidAIUnlock === true, "Demo package does not create LawAidAI unlock");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");

const requiredAssets = packet.assetRecords.filter((a: any) => a.required === true);
assert(requiredAssets.length === 3, "Three required demo assets exist");

for (const asset of requiredAssets) {
  assert(asset.exists === true, `${asset.file} exists`);
  assert(asset.sizeBytes > 0, `${asset.file} is non-empty`);
  assert(typeof asset.sha256 === "string" && asset.sha256.length > 0, `${asset.file} hash exists`);
}

assert(fs.existsSync(packet.demoFiles.script), "Demo script exists");
assert(fs.existsSync(packet.demoFiles.runOfShow), "Demo run of show exists");
assert(fs.existsSync(packet.demoFiles.narration), "Demo narration exists");
assert(fs.existsSync(packet.demoFiles.reviewHtml), "Demo review HTML exists");

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_3_SMOKE=PASS");









