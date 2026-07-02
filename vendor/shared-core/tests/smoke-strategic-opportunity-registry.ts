import fs from "fs";
import {
  captureStrategicOpportunity,
  checkPromotionToBuildInstruction,
  getStrategicOpportunityLedgerPath,
  recordPromotionChecked,
  surfaceCodeNow
} from "../strategic-opportunity-registry";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const strategyCapture = captureStrategicOpportunity({
  title: "Future partner adapter strategy",
  summary: "Strategy context for future partner adapter registry and outbound integration options.",
  source: "conversation",
  relatedModules: ["partner-adapter-registry"],
  requestedStatus: "STRATEGY_CONTEXT",
  priority: "MEDIUM",
  dependencies: [],
  futureTrigger: "When partner integration work resumes"
});

assert(strategyCapture.record.status === "STRATEGY_CONTEXT", "Strategy can be captured");
assert(strategyCapture.record.authorityBoundary.registryEntryIsNotDoctrine === true, "Captured strategy is not doctrine");
assert(strategyCapture.record.authorityBoundary.registryEntryIsNotBuildAuthorization === true, "Captured strategy is not build authorization");
assert(strategyCapture.record.authorityBoundary.registryEntryIsNotProductCommitment === true, "Captured strategy is not product commitment");

const heldCapture = captureStrategicOpportunity({
  title: "Hold experimental market branch",
  summary: "Hold this branch until pricing, offer, and current shared-core movement are verified.",
  source: "operator_observation",
  relatedModules: ["market-option"],
  requestedStatus: "HOLD",
  priority: "LOW",
  dependencies: ["pricing clarity"]
});

const heldPromotion = checkPromotionToBuildInstruction(heldCapture.record);
recordPromotionChecked(heldCapture.record, heldPromotion);

assert(heldPromotion.allowed === false, "Held item cannot become build instruction");
assert(heldPromotion.reason === "HELD_ITEM_CANNOT_BECOME_BUILD_INSTRUCTION", "Held item refusal reason is correct");

const codeNowCapture = captureStrategicOpportunity({
  title: "Strategic Opportunity Registry",
  summary: "Code now: create shared-core registry to preserve strategy signals without doctrine promotion.",
  source: "user_directive",
  relatedModules: ["shared-core", "strategic-opportunity-registry"],
  requestedStatus: "CODE_NOW",
  priority: "HIGH",
  dependencies: []
});

const codeNowItems = surfaceCodeNow([
  strategyCapture.record,
  heldCapture.record,
  codeNowCapture.record
]);

assert(codeNowItems.length === 1, "CODE_NOW item can be surfaced");
assert(codeNowItems[0].title === "Strategic Opportunity Registry", "Correct CODE_NOW item surfaced");

const supersededCapture = captureStrategicOpportunity({
  title: "Superseded old workflow branch",
  summary: "Superseded path that should not promote into active build instruction.",
  source: "coding_session",
  relatedModules: ["old-workflow"],
  requestedStatus: "SUPERSEDED",
  priority: "LOW",
  dependencies: []
});

const supersededPromotion = checkPromotionToBuildInstruction(supersededCapture.record);
recordPromotionChecked(supersededCapture.record, supersededPromotion);

assert(supersededPromotion.allowed === false, "Superseded item cannot be promoted");
assert(supersededPromotion.reason === "SUPERSEDED_ITEM_CANNOT_BE_PROMOTED", "Superseded refusal reason is correct");

const ledgerPath = getStrategicOpportunityLedgerPath();
assert(fs.existsSync(ledgerPath), "Ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "Ledger contains entries");

console.log("");
console.log("STRATEGIC_OPPORTUNITY_REGISTRY_SMOKE=PASS");









