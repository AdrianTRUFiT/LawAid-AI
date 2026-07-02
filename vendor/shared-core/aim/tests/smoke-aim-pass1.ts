import {
  AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES,
  AIM_EVIDENCE_LABELS,
  AIM_FORBIDDEN_LANGUAGE,
  AIM_INFRASTRUCTURE_LAYERS,
  AIM_STRATEGIC_DENIAL_EFFECTS,
  analyzeAimPressureSignal,
  getAimDoctrineContract,
  type AimPressureSignal
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const doctrine = getAimDoctrineContract();

assert(doctrine.productBrand === "AIM â€” AI MarketIntel", "AIM product brand changed.");
assert(doctrine.internalDoctrine === "Awareness + Infrastructure Mapping", "AIM doctrine changed.");
assert(doctrine.legalBoundary.includes("does not provide financial advice"), "Legal boundary missing financial advice prohibition.");
assert(doctrine.legalBoundary.includes("execute trades"), "Legal boundary missing trade execution prohibition.");

const requiredLayers = [
  "Compute",
  "Memory / HBM",
  "Networking / Optical",
  "Power / Grid",
  "Cooling / Thermal",
  "Fabrication / Equipment",
  "Sovereign / Defense",
  "Quantum / Frontier Compute",
  "Data / Licensing",
  "Land / Permitting",
  "Advanced Packaging"
];

for (const layer of requiredLayers) {
  assert(AIM_INFRASTRUCTURE_LAYERS.includes(layer as never), "Missing infrastructure layer: " + layer);
}

const requiredEvidence = [
  "Confirmed public filing",
  "Company announcement",
  "Reputable reporting",
  "Industry inference",
  "Speculation",
  "Rumor / Ignore"
];

for (const evidence of requiredEvidence) {
  assert(AIM_EVIDENCE_LABELS.includes(evidence as never), "Missing evidence label: " + evidence);
}

const requiredSignalTypes = [
  "supplier acquisition",
  "long-term supply agreement",
  "exclusive partnership",
  "power purchase agreement",
  "compute reservation",
  "HBM allocation",
  "foundry reservation",
  "advanced packaging allocation",
  "data licensing deal",
  "sovereign cloud contract",
  "fiber route control",
  "energy infrastructure control",
  "rare earth / metals offtake",
  "strategic investment",
  "talent acquisition"
];

for (const signalType of requiredSignalTypes) {
  assert(AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES.includes(signalType as never), "Missing chokepoint signal type: " + signalType);
}

for (const effect of ["None", "Low", "Moderate", "High", "Critical"]) {
  assert(AIM_STRATEGIC_DENIAL_EFFECTS.includes(effect as never), "Missing strategic denial effect: " + effect);
}

const reviewReadySignal: AimPressureSignal = {
  signalId: "aim_signal_hbm_001",
  observedAt: "2026-05-11T20:00:00.000Z",
  signalObserved: "Signal detected: HBM allocation pressure is increasing across AI infrastructure demand.",
  infrastructureLayer: "Memory / HBM",
  dependencyMapped: "AI compute expansion depends on constrained HBM supply and advanced packaging availability.",
  evidenceLabel: "Company announcement",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: true,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: true
  },
  chokepointSignalType: "HBM allocation",
  strategicDenialEffect: "High",
  thesisNote: "Thesis strengthening only after review: memory capacity may govern AI infrastructure throughput."
};

const reviewReadyOutput = analyzeAimPressureSignal(reviewReadySignal);

assert(reviewReadyOutput.dependencyMap.pressureDetected === true, "AIM did not detect pressure.");
assert(reviewReadyOutput.dependencyMap.infrastructureLayer === "Memory / HBM", "AIM did not map infrastructure layer.");
assert(reviewReadyOutput.evidenceClassification.label === "Company announcement", "AIM did not classify evidence strength.");
assert(reviewReadyOutput.evidenceClassification.verifiedTruth === true, "Company announcement should be verified evidence.");
assert(reviewReadyOutput.bottleneckClassification.tighteningSignalCount === 3, "2-of-4 tightening count failed.");
assert(reviewReadyOutput.bottleneckClassification.phase === "Tightening", "2-of-4 tightening rule failed.");
assert(reviewReadyOutput.chokepointClassification.signalType === "HBM allocation", "Chokepoint control classification failed.");
assert(reviewReadyOutput.chokepointClassification.descriptiveOnly === true, "Chokepoint effect must remain descriptive only.");
assert(reviewReadyOutput.paiSafeReadinessHandoff.destination === "PAI-SAFE", "PAI-SAFE handoff destination missing.");
assert(reviewReadyOutput.paiSafeReadinessHandoff.readinessState === "Review Ready", "Review Ready state not produced.");
assert(reviewReadyOutput.journalReadyDecisionRecord.finalAction === "", "Final action must remain blank.");
assert(reviewReadyOutput.journalReadyDecisionRecord.humanReviewRequired === true, "Human review must be required.");
assert(reviewReadyOutput.humanFinalAuthority === true, "Human final authority missing.");
assert(reviewReadyOutput.tradeRecommendation === null, "AIM must not recommend trades.");
assert(reviewReadyOutput.executionAction === null, "AIM must not execute action.");

const narrativeSignal: AimPressureSignal = {
  signalId: "aim_signal_compute_002",
  observedAt: "2026-05-11T20:05:00.000Z",
  signalObserved: "Narrative forming around compute scarcity without confirming evidence.",
  infrastructureLayer: "Compute",
  dependencyMapped: "Compute capacity may depend on future GPU availability, but evidence is insufficient.",
  evidenceLabel: "Speculation",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: false,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: false
  },
  chokepointSignalType: "compute reservation",
  strategicDenialEffect: "Moderate",
  thesisNote: "Hold for confirmation."
};

const narrativeOutput = analyzeAimPressureSignal(narrativeSignal);

assert(narrativeOutput.bottleneckClassification.phase === "Narrative Only â€” Not Confirmed", "Fewer than 2 signals must not mark tightening.");
assert(narrativeOutput.paiSafeReadinessHandoff.readinessState === "Insufficient Evidence", "Speculation must produce Insufficient Evidence.");
assert(narrativeOutput.evidenceClassification.verifiedTruth === false, "Speculation must not be verified truth.");

const rumorSignal: AimPressureSignal = {
  ...narrativeSignal,
  signalId: "aim_signal_compute_003",
  evidenceLabel: "Rumor / Ignore",
  signalObserved: "Rumor about supply constraint.",
  thesisNote: "Ignore until confirmed."
};

const rumorOutput = analyzeAimPressureSignal(rumorSignal);
assert(rumorOutput.paiSafeReadinessHandoff.readinessState !== "Review Ready", "Rumor / Ignore must not produce Review Ready.");

const contradictionSignal: AimPressureSignal = {
  ...reviewReadySignal,
  signalId: "aim_signal_hbm_004",
  contradictionNote: "Contradictory filing undermines the pressure thesis."
};

const contradictionOutput = analyzeAimPressureSignal(contradictionSignal);
assert(contradictionOutput.paiSafeReadinessHandoff.readinessState === "Contradiction Detected", "Contradiction must be detected.");
assert(contradictionOutput.bottleneckClassification.phase === "Thesis Broken", "Contradiction should break the thesis.");

const serialized = JSON.stringify({ reviewReadyOutput, narrativeOutput, rumorOutput, contradictionOutput }).toLowerCase();

for (const phrase of AIM_FORBIDDEN_LANGUAGE) {
  assert(!serialized.includes(phrase.toLowerCase()), "Forbidden language present: " + phrase);
}

console.log("AIM_PASS_1_CORE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    productBrand: reviewReadyOutput.productBrand,
    internalDoctrine: reviewReadyOutput.internalDoctrine,
    tested: [
      "AIM detects a pressure signal",
      "AIM maps infrastructure layer",
      "AIM classifies evidence strength",
      "AIM classifies bottleneck phase",
      "AIM enforces 2-of-4 tightening rule",
      "AIM classifies chokepoint control signal type",
      "AIM maps strategic dependency",
      "AIM produces PAI-SAFE readiness handoff packet",
      "AIM produces journal-ready decision record",
      "AIM does not recommend trades",
      "AIM does not execute action",
      "human authority remains final",
      "speculation is not verified truth",
      "rumor does not produce Review Ready",
      "contradiction detected"
    ],
    status: "PASS"
  },
  null,
  2
));