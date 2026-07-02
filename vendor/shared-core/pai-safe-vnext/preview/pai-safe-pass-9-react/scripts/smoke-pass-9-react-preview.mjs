import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

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
  assert(existsSync(join(root, file)), `Missing required Pass 9 file: ${file}`);
}

const appSource = readFileSync(join(root, "src/App.tsx"), "utf8");
const distIndex = readFileSync(join(root, "dist/index.html"), "utf8");

const forbiddenBusinessLogic = [
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
  "wallet"
];

for (const forbidden of forbiddenBusinessLogic) {
  assert(!appSource.includes(forbidden), `React preview contains forbidden logic or integration marker: ${forbidden}`);
}

assert(!appSource.includes("<button"), "React preview must not render mutation buttons.");
assert(!appSource.includes("onClick"), "React preview must not contain click mutation handlers.");

const manifest = JSON.parse(readFileSync(join(root, "src/fixtures/manifest.json"), "utf8"));

assert(manifest.fixtureCount === 6, "Manifest fixture count mismatch.");
assert(manifest.boundary.noPayments === true, "Manifest noPayments boundary missing.");
assert(manifest.boundary.noExternalApis === true, "Manifest noExternalApis boundary missing.");
assert(manifest.boundary.noCustody === true, "Manifest noCustody boundary missing.");
assert(manifest.boundary.noSoulWritePath === true, "Manifest noSoulWritePath boundary missing.");
assert(manifest.boundary.noFundTrackerBridge === true, "Manifest noFundTrackerBridge boundary missing.");

const fixtureFiles = [
  "pai_safe_fixture_safe.json",
  "pai_safe_fixture_hold.json",
  "pai_safe_fixture_refused.json",
  "pai_safe_fixture_empty.json",
  "pai_safe_fixture_loading.json",
  "pai_safe_fixture_unavailable.json"
];

const scenarios = [];

for (const file of fixtureFiles) {
  const fixture = JSON.parse(readFileSync(join(root, "src/fixtures", file), "utf8"));
  scenarios.push(fixture.scenario);

  assert(fixture.authority.createsTruth === false, `${fixture.scenario}: fixture creates truth`);
  assert(fixture.authority.mutatesState === false, `${fixture.scenario}: fixture mutates state`);
  assert(fixture.authority.authorizesPayment === false, `${fixture.scenario}: fixture authorizes payment`);
  assert(fixture.authority.writesCustody === false, `${fixture.scenario}: fixture writes custody`);
  assert(fixture.authority.promotesDoctrine === false, `${fixture.scenario}: fixture promotes doctrine`);

  const merchantJson = JSON.stringify(fixture.uiState.merchantScreen);
  const consumerJson = JSON.stringify(fixture.uiState.consumerScreen);
  const internalJson = JSON.stringify(fixture.uiState.internalReviewScreen);

  assert(!merchantJson.includes("riskCodes"), `${fixture.scenario}: merchant preview fixture leaks riskCodes`);
  assert(!merchantJson.includes("requestHash"), `${fixture.scenario}: merchant preview fixture leaks requestHash`);
  assert(!merchantJson.includes("decisionHash"), `${fixture.scenario}: merchant preview fixture leaks decisionHash`);
  assert(!merchantJson.includes("recordHash"), `${fixture.scenario}: merchant preview fixture leaks recordHash`);
  assert(!merchantJson.includes("receiptHash"), `${fixture.scenario}: merchant preview fixture leaks receiptHash`);

  assert(!consumerJson.includes("riskCodes"), `${fixture.scenario}: consumer preview fixture leaks riskCodes`);
  assert(!consumerJson.includes("requestHash"), `${fixture.scenario}: consumer preview fixture leaks requestHash`);
  assert(!consumerJson.includes("decisionHash"), `${fixture.scenario}: consumer preview fixture leaks decisionHash`);
  assert(!consumerJson.includes("recordHash"), `${fixture.scenario}: consumer preview fixture leaks recordHash`);
  assert(!consumerJson.includes("receiptHash"), `${fixture.scenario}: consumer preview fixture leaks receiptHash`);

  if (fixture.scenario === "SAFE" || fixture.scenario === "HOLD" || fixture.scenario === "REFUSED") {
    assert(internalJson.includes("riskCodes"), `${fixture.scenario}: internal preview should include riskCodes`);
  }
}

assert(
  JSON.stringify(scenarios.sort()) === JSON.stringify(["EMPTY", "HOLD", "LOADING", "REFUSED", "SAFE", "UNAVAILABLE"]),
  "Scenario set mismatch."
);

assert(distIndex.includes("PAI-SAFE Pass 9 Minimal React UI Preview"), "Built dist index missing title.");

console.log("PAI_SAFE_PASS_9_MINIMAL_REACT_UI_PREVIEW=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "minimal React preview app created",
      "Pass 6 fixtures copied",
      "fixture-only rendering",
      "no transaction business logic in React",
      "no fetch or external API behavior",
      "no mutation buttons",
      "SAFE fixture render source",
      "HOLD fixture render source",
      "REFUSED fixture render source",
      "EMPTY fixture render source",
      "LOADING fixture render source",
      "UNAVAILABLE fixture render source",
      "merchant hidden-field boundary",
      "consumer hidden-field boundary",
      "internal review visibility",
      "Vite build output"
    ],
    status: "PASS"
  },
  null,
  2
));