import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-5b.json");

assert(fs.existsSync(packetPath), "Pass 5B packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.mp4ExportOnly === true, "Pass 5B is MP4-export only");
assert(packet.boundary.mp4ExportIsNotRuntime === true, "MP4 export is not runtime");
assert(packet.boundary.mp4ExportIsNotActivation === true, "MP4 export is not activation");
assert(packet.boundary.mp4ExportIsNotDeployment === true, "MP4 export is not deployment");
assert(packet.boundary.mp4ExportDoesNotCreateActivatedTransactionState === true, "MP4 export does not create Activated Transaction State");
assert(packet.boundary.mp4ExportDoesNotCreateLawAidAIUnlock === true, "MP4 export does not create LawAidAI unlock");
assert(packet.boundary.mp4ExportDoesNotCertifyEvidence === true, "MP4 export does not certify evidence");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");
assert(fs.existsSync(packet.playerHtml), "Browser player remains available");

if (packet.mp4Rendered === true) {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5B_MP4_EXPORTED", "MP4 export status is ready");
  assert(fs.existsSync(packet.mp4Path), "MP4 exists");
} else {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5B_MP4_EXPORT_BLOCKED", "MP4 blocked status is valid");
}

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_5B_SMOKE=PASS");









