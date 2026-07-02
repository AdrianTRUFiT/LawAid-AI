import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-5c.json");

assert(fs.existsSync(packetPath), "Pass 5C packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.portableFfmpegExportOnly === true, "Pass 5C is portable FFmpeg export only");
assert(packet.boundary.mp4ExportIsNotRuntime === true, "MP4 export is not runtime");
assert(packet.boundary.mp4ExportIsNotActivation === true, "MP4 export is not activation");
assert(packet.boundary.mp4ExportIsNotDeployment === true, "MP4 export is not deployment");
assert(packet.boundary.mp4ExportDoesNotCreateActivatedTransactionState === true, "MP4 export does not create Activated Transaction State");
assert(packet.boundary.mp4ExportDoesNotCreateLawAidAIUnlock === true, "MP4 export does not create LawAidAI unlock");
assert(packet.boundary.mp4ExportDoesNotCertifyEvidence === true, "MP4 export does not certify evidence");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");
assert(fs.existsSync(packet.playerHtml), "Browser player remains available");

if (packet.mp4Rendered === true) {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5C_MP4_EXPORTED", "MP4 export status is ready");
  assert(fs.existsSync(packet.mp4Path), "MP4 exists");
  assert(packet.mp4SizeBytes > 0, "MP4 is non-empty");
  assert(typeof packet.mp4Sha256 === "string" && packet.mp4Sha256.length > 0, "MP4 hash exists");
} else {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5C_MP4_EXPORT_BLOCKED", "MP4 blocked status is valid");
}

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_5C_SMOKE=PASS");









