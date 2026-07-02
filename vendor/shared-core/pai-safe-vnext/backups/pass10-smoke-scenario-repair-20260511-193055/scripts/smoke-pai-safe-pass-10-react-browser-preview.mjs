import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const moduleRoot = process.cwd();
const reactRoot = join(moduleRoot, "preview", "pai-safe-pass-9-react");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const requiredFiles = [
  "package.json",
  "index.html",
  "src/App.tsx",
  "src/main.tsx",
  "src/index.css",
  "src/fixtures/manifest.json",
  "src/fixtures/pai_safe_fixture_safe.json",
  "src/fixtures/pai_safe_fixture_hold.json",
  "src/fixtures/pai_safe_fixture_refused.json",
  "src/fixtures/pai_safe_fixture_empty.json",
  "src/fixtures/pai_safe_fixture_loading.json",
  "src/fixtures/pai_safe_fixture_unavailable.json",
  "dist/index.html"
];

for (const file of requiredFiles) {
  assert(existsSync(join(reactRoot, file)), `Missing Pass 10 React browser file: ${file}`);
}

const appSource = readFileSync(join(reactRoot, "src", "App.tsx"), "utf8");
const distIndex = readFileSync(join(reactRoot, "dist", "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(reactRoot, "src", "fixtures", "manifest.json"), "utf8"));

const requiredSourceSignals = [
  "PAI-SAFE Pass 9",
  "Minimal React UI Preview",
  "Circuit decides",
  "Projection reflects",
  "Surface contract maps",
  "Screen state prepares",
  "Fixture packet exports",
  "React preview reads fixtures",
  "UI renders later",
  "Merchant Preview",
  "Consumer Preview",
  "Internal Review Preview",
  "SAFE",
  "HOLD",
  "REFUSED"
];

for (const signal of requiredSourceSignals) {
  assert(appSource.includes(signal), `React source missing browser smoke signal: ${signal}`);
}

const forbiddenMarkers = [
  "runPaiSafeTransactionCircuit",
  "projectPaiSafeTransactionState",
  "buildPaiSafeSurfaceContractPacket",
  "buildPaiSafeUiStatePacket",
  "authorizePayment(",
  "writeCustody(",
  "promoteDoctrine(",
  "fetch(",
  "XMLHttpRequest",
  "axios",
  "stripe",
  "checkout",
  "wallet",
  "<button",
  "onClick"
];

for (const marker of forbiddenMarkers) {
  assert(!appSource.includes(marker), `Forbidden Pass 10 marker found in React source: ${marker}`);
}

assert(manifest.fixtureCount === 6, "Fixture count must remain 6.");
assert(manifest.boundary.noPayments === true, "noPayments boundary missing.");
assert(manifest.boundary.noExternalApis === true, "noExternalApis boundary missing.");
assert(manifest.boundary.noCustody === true, "noCustody boundary missing.");
assert(manifest.boundary.noSoulWritePath === true, "noSoulWritePath boundary missing.");
assert(manifest.boundary.noFundTrackerBridge === true, "noFundTrackerBridge boundary missing.");

assert(distIndex.includes('<div id="root"></div>'), "Built React dist root missing.");
assert(distIndex.includes("script"), "Built React dist script missing.");

console.log("PAI_SAFE_PASS_10_REACT_BROWSER_SMOKE=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "Pass 9 React preview dist exists",
      "React source browser smoke signals",
      "SAFE HOLD REFUSED source visibility",
      "merchant consumer internal review component source",
      "fixture-only boundary",
      "no transaction logic in React",
      "no payment wallet custody controls",
      "no external API behavior",
      "manifest boundaries",
      "built dist browser readiness"
    ],
    status: "PASS"
  },
  null,
  2
));