import { verifyThinkBaseSoulBaseBoundary } from "../memory-boundary";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const result = verifyThinkBaseSoulBaseBoundary();

assert(
  result.status === "THINKBASE_SOULBASE_BOUNDARY_VERIFICATION_READY",
  "Boundary verification status ready"
);

assert(result.preCanonical === true, "Result is pre-canonical");
assert(result.stage2Blocked === true, "Stage 2 remains blocked pending gap resolution");
assert(result.defaultCrossingPosture === "DENY", "Default crossing posture is DENY");

assert(result.layerDefinitions.length === 5, "Five boundary layers defined");

const thinkBase = result.layerDefinitions.find((layer) => layer.key === "THINKBASE_AI");
const soulBase = result.layerDefinitions.find((layer) => layer.key === "SOULBASE_AI");
const soulVault = result.layerDefinitions.find((layer) => layer.key === "SOULVAULT");
const soulMemory = result.layerDefinitions.find((layer) => layer.key === "SOULMEMORY");
const soulMark = result.layerDefinitions.find((layer) => layer.key === "SOULMARK");

assert(thinkBase !== undefined, "ThinkBaseAI definition exists");
assert(soulBase !== undefined, "SoulBaseAI? definition exists");
assert(soulVault !== undefined, "SoulVault? definition exists");
assert(soulMemory !== undefined, "SoulMemory? definition exists");
assert(soulMark !== undefined, "SoulMark? definition exists");

assert(thinkBase!.role.includes("Processing"), "ThinkBaseAI is processing substrate");
assert(soulBase!.role.includes("Personal continuity"), "SoulBaseAI? is personal continuity substrate");
assert(soulVault!.role.includes("Custody"), "SoulVault? is custody plane");
assert(soulMemory!.role.includes("Memory doctrine"), "SoulMemory? is doctrine layer");
assert(soulMark!.role.includes("Authorship"), "SoulMark? is authorship signal");

assert(
  result.financialMemoryCrossingRule.mayPersistAsFinancialMemory.includes("ledger-safe summary"),
  "Ledger-safe summary may persist as financial memory"
);

assert(
  result.financialMemoryCrossingRule.mustRemainPrivateSourceData.includes("bank statements"),
  "Bank statements remain private source data"
);

assert(
  result.financialMemoryCrossingRule.cannotCrossByDefault.includes("raw processor objects"),
  "Raw processor objects cannot cross by default"
);

assert(result.gaps.length === 4, "Four gaps identified");
assert(result.gaps.every((gap) => gap.blocksStage2 === true), "All gaps block Stage 2");

assert(result.boundary.thinkBaseDoesNotOwnTruth === true, "ThinkBaseAI does not own truth");
assert(result.boundary.soulBaseDoesNotBecomeTransactionTruth === true, "SoulBaseAI? does not become transaction truth");
assert(result.boundary.soulBaseDoesNotBecomePaymentAuthority === true, "SoulBaseAI? does not become payment authority");
assert(result.boundary.soulBaseDoesNotOwnRawBankDataByDefault === true, "SoulBaseAI? does not own raw bank data by default");
assert(result.boundary.soulBaseDoesNotReplaceSoulVaultCustody === true, "SoulBaseAI? does not replace SoulVault? custody");
assert(result.boundary.soulBaseDoesNotOverrideFundTrackerAI === true, "SoulBaseAI? does not override FundTrackerAI");
assert(result.boundary.soulBaseDoesNotOverrideUserAuthorization === true, "SoulBaseAI? does not override user authorization");
assert(result.boundary.defaultPostureIsDeny === true, "Default posture is deny");

console.log("");
console.log("THINKBASE_SOULBASE_BOUNDARY_VERIFICATION_SMOKE=PASS");










