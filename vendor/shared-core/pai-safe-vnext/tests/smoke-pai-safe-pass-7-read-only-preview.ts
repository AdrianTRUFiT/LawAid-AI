import {
  buildAllPaiSafeFixtureRecords
} from "../src/fixtureBuilder.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const records = buildAllPaiSafeFixtureRecords();

assert(records.length === 6, "Pass 7 expected six preview fixture records.");

const scenarioSet = records.map((record) => record.scenario).sort();

assert(
  JSON.stringify(scenarioSet) === JSON.stringify(["EMPTY", "HOLD", "LOADING", "REFUSED", "SAFE", "UNAVAILABLE"]),
  "Pass 7 scenario set mismatch."
);

for (const record of records) {
  assert(record.authority.createsTruth === false, `${record.scenario}: fixture must not create truth`);
  assert(record.authority.mutatesState === false, `${record.scenario}: fixture must not mutate state`);
  assert(record.authority.authorizesPayment === false, `${record.scenario}: fixture must not authorize payment`);
  assert(record.authority.writesCustody === false, `${record.scenario}: fixture must not write custody`);
  assert(record.authority.promotesDoctrine === false, `${record.scenario}: fixture must not promote doctrine`);

  const ui = record.uiState;

  assert(ui.uiAuthority.createsTruth === false, `${record.scenario}: UI state must not create truth`);
  assert(ui.uiAuthority.mutatesState === false, `${record.scenario}: UI state must not mutate state`);
  assert(ui.uiAuthority.authorizesPayment === false, `${record.scenario}: UI state must not authorize payment`);
  assert(ui.uiAuthority.writesCustody === false, `${record.scenario}: UI state must not write custody`);

  assert(ui.merchantScreen.readOnlyGuard.readOnly === true, `${record.scenario}: merchant screen must be read-only`);
  assert(ui.consumerScreen.readOnlyGuard.readOnly === true, `${record.scenario}: consumer screen must be read-only`);
  assert(ui.internalReviewScreen.readOnlyGuard.readOnly === true, `${record.scenario}: internal screen must be read-only`);

  const merchantJson = JSON.stringify(ui.merchantScreen);
  const consumerJson = JSON.stringify(ui.consumerScreen);
  const internalJson = JSON.stringify(ui.internalReviewScreen);

  assert(!merchantJson.includes("riskCodes"), `${record.scenario}: merchant preview would leak riskCodes`);
  assert(!merchantJson.includes("requestHash"), `${record.scenario}: merchant preview would leak requestHash`);
  assert(!merchantJson.includes("decisionHash"), `${record.scenario}: merchant preview would leak decisionHash`);
  assert(!merchantJson.includes("recordHash"), `${record.scenario}: merchant preview would leak recordHash`);
  assert(!merchantJson.includes("receiptHash"), `${record.scenario}: merchant preview would leak receiptHash`);

  assert(!consumerJson.includes("riskCodes"), `${record.scenario}: consumer preview would leak riskCodes`);
  assert(!consumerJson.includes("requestHash"), `${record.scenario}: consumer preview would leak requestHash`);
  assert(!consumerJson.includes("decisionHash"), `${record.scenario}: consumer preview would leak decisionHash`);
  assert(!consumerJson.includes("recordHash"), `${record.scenario}: consumer preview would leak recordHash`);
  assert(!consumerJson.includes("receiptHash"), `${record.scenario}: consumer preview would leak receiptHash`);

  if (record.scenario === "SAFE" || record.scenario === "HOLD" || record.scenario === "REFUSED") {
    assert(internalJson.includes("riskCodes"), `${record.scenario}: internal preview should include riskCodes`);
  }

  if (record.scenario === "SAFE") {
    assert(ui.decision === "SAFE", "SAFE preview decision mismatch");
    assert(ui.merchantScreen.stateKind === "SAFE_STATE", "SAFE merchant state mismatch");
    assert(ui.consumerScreen.stateKind === "SAFE_STATE", "SAFE consumer state mismatch");
    assert(ui.internalReviewScreen.stateKind === "SAFE_STATE", "SAFE internal state mismatch");
  }

  if (record.scenario === "HOLD") {
    assert(ui.decision === "HOLD", "HOLD preview decision mismatch");
    assert(ui.merchantScreen.stateKind === "HOLD_STATE", "HOLD merchant state mismatch");
    assert(ui.consumerScreen.stateKind === "HOLD_STATE", "HOLD consumer state mismatch");
    assert(ui.internalReviewScreen.stateKind === "HOLD_STATE", "HOLD internal state mismatch");
  }

  if (record.scenario === "REFUSED") {
    assert(ui.decision === "REFUSED", "REFUSED preview decision mismatch");
    assert(ui.merchantScreen.stateKind === "REFUSED_STATE", "REFUSED merchant state mismatch");
    assert(ui.consumerScreen.stateKind === "REFUSED_STATE", "REFUSED consumer state mismatch");
    assert(ui.internalReviewScreen.stateKind === "REFUSED_STATE", "REFUSED internal state mismatch");
  }

  if (record.scenario === "EMPTY") {
    assert(ui.decision === null, "EMPTY preview decision should be null");
    assert(ui.merchantScreen.screenMode === "EMPTY", "EMPTY merchant mode mismatch");
  }

  if (record.scenario === "LOADING") {
    assert(ui.decision === null, "LOADING preview decision should be null");
    assert(ui.merchantScreen.screenMode === "LOADING", "LOADING merchant mode mismatch");
  }

  if (record.scenario === "UNAVAILABLE") {
    assert(ui.decision === null, "UNAVAILABLE preview decision should be null");
    assert(ui.merchantScreen.screenMode === "UNAVAILABLE", "UNAVAILABLE merchant mode mismatch");
  }
}

const first = JSON.stringify(buildAllPaiSafeFixtureRecords());
const second = JSON.stringify(buildAllPaiSafeFixtureRecords());

assert(first === second, "Pass 7 preview fixture input is not deterministic.");

console.log("PAI_SAFE_PASS_7_READ_ONLY_PREVIEW_HARNESS=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "preview fixture input set",
      "SAFE preview readiness",
      "HOLD preview readiness",
      "REFUSED preview readiness",
      "EMPTY preview readiness",
      "LOADING preview readiness",
      "UNAVAILABLE preview readiness",
      "merchant hidden-field boundary",
      "consumer hidden-field boundary",
      "internal review visibility",
      "read-only posture",
      "no authority drift",
      "deterministic preview input"
    ],
    status: "PASS"
  },
  null,
  2
));