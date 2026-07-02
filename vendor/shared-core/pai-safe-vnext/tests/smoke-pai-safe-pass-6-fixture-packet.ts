import {
  buildAllPaiSafeFixtureRecords
} from "../src/fixtureBuilder.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const records = buildAllPaiSafeFixtureRecords();

assert(records.length === 6, "Expected six fixture records.");

const scenarios = records.map((record) => record.scenario).sort();

assert(
  JSON.stringify(scenarios) === JSON.stringify(["EMPTY", "HOLD", "LOADING", "REFUSED", "SAFE", "UNAVAILABLE"]),
  "Scenario set mismatch."
);

for (const record of records) {
  assert(record.authority.createsTruth === false, `${record.scenario}: fixture must not create truth`);
  assert(record.authority.mutatesState === false, `${record.scenario}: fixture must not mutate state`);
  assert(record.authority.authorizesPayment === false, `${record.scenario}: fixture must not authorize payment`);
  assert(record.authority.writesCustody === false, `${record.scenario}: fixture must not write custody`);
  assert(record.authority.promotesDoctrine === false, `${record.scenario}: fixture must not promote doctrine`);
  assert(record.authority.uiRendersLater === true, `${record.scenario}: UI render-later flag missing`);

  assert(record.uiState.uiAuthority.createsTruth === false, `${record.scenario}: UI state creates truth`);
  assert(record.uiState.uiAuthority.mutatesState === false, `${record.scenario}: UI state mutates state`);
  assert(record.uiState.uiAuthority.authorizesPayment === false, `${record.scenario}: UI state authorizes payment`);
  assert(record.uiState.uiAuthority.writesCustody === false, `${record.scenario}: UI state writes custody`);

  const merchantJson = JSON.stringify(record.uiState.merchantScreen);
  const consumerJson = JSON.stringify(record.uiState.consumerScreen);

  assert(!merchantJson.includes("riskCodes"), `${record.scenario}: merchant fixture leaks riskCodes`);
  assert(!merchantJson.includes("requestHash"), `${record.scenario}: merchant fixture leaks requestHash`);
  assert(!merchantJson.includes("decisionHash"), `${record.scenario}: merchant fixture leaks decisionHash`);
  assert(!merchantJson.includes("recordHash"), `${record.scenario}: merchant fixture leaks recordHash`);
  assert(!merchantJson.includes("receiptHash"), `${record.scenario}: merchant fixture leaks receiptHash`);

  assert(!consumerJson.includes("riskCodes"), `${record.scenario}: consumer fixture leaks riskCodes`);
  assert(!consumerJson.includes("requestHash"), `${record.scenario}: consumer fixture leaks requestHash`);
  assert(!consumerJson.includes("decisionHash"), `${record.scenario}: consumer fixture leaks decisionHash`);
  assert(!consumerJson.includes("recordHash"), `${record.scenario}: consumer fixture leaks recordHash`);
  assert(!consumerJson.includes("receiptHash"), `${record.scenario}: consumer fixture leaks receiptHash`);

  if (record.scenario === "SAFE") {
    assert(record.uiState.decision === "SAFE", "SAFE fixture decision mismatch");
    assert(record.uiState.merchantScreen.stateKind === "SAFE_STATE", "SAFE merchant state mismatch");
  }

  if (record.scenario === "HOLD") {
    assert(record.uiState.decision === "HOLD", "HOLD fixture decision mismatch");
    assert(record.uiState.merchantScreen.stateKind === "HOLD_STATE", "HOLD merchant state mismatch");
  }

  if (record.scenario === "REFUSED") {
    assert(record.uiState.decision === "REFUSED", "REFUSED fixture decision mismatch");
    assert(record.uiState.merchantScreen.stateKind === "REFUSED_STATE", "REFUSED merchant state mismatch");
  }

  if (record.scenario === "EMPTY") {
    assert(record.uiState.decision === null, "EMPTY fixture decision should be null");
    assert(record.uiState.merchantScreen.screenMode === "EMPTY", "EMPTY merchant mode mismatch");
  }

  if (record.scenario === "LOADING") {
    assert(record.uiState.decision === null, "LOADING fixture decision should be null");
    assert(record.uiState.merchantScreen.screenMode === "LOADING", "LOADING merchant mode mismatch");
  }

  if (record.scenario === "UNAVAILABLE") {
    assert(record.uiState.decision === null, "UNAVAILABLE fixture decision should be null");
    assert(record.uiState.merchantScreen.screenMode === "UNAVAILABLE", "UNAVAILABLE merchant mode mismatch");
  }
}

const first = JSON.stringify(buildAllPaiSafeFixtureRecords());
const second = JSON.stringify(buildAllPaiSafeFixtureRecords());

assert(first === second, "Fixture builder output is not deterministic.");

console.log("PAI_SAFE_PASS_6_FIXTURE_PACKET=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "SAFE fixture record",
      "HOLD fixture record",
      "REFUSED fixture record",
      "EMPTY fixture record",
      "LOADING fixture record",
      "UNAVAILABLE fixture record",
      "authority flags",
      "hidden-field leakage",
      "deterministic fixture output",
      "screen-state scenario mapping"
    ],
    status: "PASS"
  },
  null,
  2
));