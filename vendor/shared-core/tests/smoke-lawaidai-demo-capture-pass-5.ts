import fs from "fs";
import path from "path";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const captureRoot = "D:/DEV/AIVA/shared-data/lawaidai-demo-capture";
const packetPath = path.join(captureRoot, "lawaidai-demo-capture-pass-5.json");

assert(fs.existsSync(packetPath), "Pass 5 packet exists");
const packet = JSON.parse(fs.readFileSync(packetPath, "utf8"));

assert(packet.recordingRenderOnly === true, "Pass 5 is recording-render only");
assert(packet.boundary.recordingRenderIsNotRuntime === true, "Recording render is not runtime");
assert(packet.boundary.recordingRenderIsNotActivation === true, "Recording render is not activation");
assert(packet.boundary.recordingRenderIsNotDeployment === true, "Recording render is not deployment");
assert(packet.boundary.recordingRenderDoesNotCreateActivatedTransactionState === true, "Recording render does not create Activated Transaction State");
assert(packet.boundary.recordingRenderDoesNotCreateLawAidAIUnlock === true, "Recording render does not create LawAidAI unlock");
assert(packet.boundary.recordingRenderDoesNotCertifyEvidence === true, "Recording render does not certify evidence");
assert(packet.boundary.fundTrackerAIVerificationRequired === true, "FundTrackerAI verification remains required");
assert(fs.existsSync(packet.storyboard), "Storyboard exists");
assert(fs.existsSync(packet.renderManifest), "Render manifest exists");
assert(fs.existsSync(packet.playerHtml), "Browser player exists");

if (packet.mp4Rendered === true) {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5_RECORDING_RENDERED", "MP4 render status is ready");
  assert(fs.existsSync(packet.mp4Path), "MP4 exists");
} else {
  assert(packet.status === "LAWAIDAI_DEMO_CAPTURE_PASS_5_PLAYER_READY_MP4_BLOCKED_FFMPEG_MISSING", "Player-ready status is valid when ffmpeg missing");
  assert(packet.ffmpegMissing === true, "ffmpeg missing is recorded");
}

console.log("");
console.log("LAWAIDAI_DEMO_CAPTURE_PASS_5_SMOKE=PASS");









