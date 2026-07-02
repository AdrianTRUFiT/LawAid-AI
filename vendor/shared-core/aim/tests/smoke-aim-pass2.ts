import {
  analyzeAimPressureSignal,
  normalizeManualEvidenceInput,
  type AimManualEvidenceInput
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const validInput: AimManualEvidenceInput = {
  inputId: "manual_hbm_001",
  observedAt: "2026-05-13T02:25:00.000Z",
  sourceType: "company announcement",
  sourceName: "Manual research note",
  signalObserved: "Signal detected: HBM allocation pressure is increasing across AI infrastructure demand.",
  infrastructureLayer: "Memory / HBM",
  dependencyClaim: "AI compute expansion depends on constrained HBM supply and advanced packaging availability.",
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

const normalized = normalizeManualEvidenceInput(validInput);

assert(normalized.status === "NORMALIZED", "Valid manual input should normalize.");
assert(normalized.normalizedSignal !== null, "Normalized signal missing.");
assert(normalized.evidenceLabel === "Company announcement", "Evidence label mapping failed.");
assert(normalized.finalAction === "", "Final action must remain blank.");
assert(normalized.humanReviewRequired === true, "Human review required must remain true.");

const analyzed = analyzeAimPressureSignal(normalized.normalizedSignal!);

assert(analyzed.paiSafeReadinessHandoff.readinessState === "Review Ready", "Normalized valid input should be Review Ready after Pass 1 analysis.");
assert(analyzed.tradeRecommendation === null, "AIM must not recommend trades.");
assert(analyzed.executionAction === null, "AIM must not execute action.");
assert(analyzed.journalReadyDecisionRecord.finalAction === "", "Journal final action must remain blank.");

const missingFieldInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_missing_001",
  sourceName: "",
  thesisNote: ""
};

const missingResult = normalizeManualEvidenceInput(missingFieldInput);

assert(missingResult.status === "HELD_FOR_MISSING_FIELDS", "Missing fields should produce hold.");
assert(missingResult.normalizedSignal === null, "Missing fields must not produce normalized signal.");
assert(missingResult.issues.some((issue) => issue.code === "MISSING_SOURCE_NAME"), "Missing source issue not detected.");
assert(missingResult.issues.some((issue) => issue.code === "MISSING_THESIS_NOTE"), "Missing thesis issue not detected.");

const speculationInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_speculation_001",
  sourceType: "speculation",
  bottleneckSignals: {
    leadTimesExpanding: true,
    pricingPowerIncreasing: false,
    capacityExpansionAnnounced: false,
    longTermAgreementsOrBacklogConfirmed: false
  },
  thesisNote: "Speculative signal only. Hold for confirmation."
};

const speculationResult = normalizeManualEvidenceInput(speculationInput);

assert(speculationResult.status === "NORMALIZED", "Speculation may normalize for tracking.");
assert(speculationResult.evidenceLabel === "Speculation", "Speculation evidence mapping failed.");

const speculationAnalyzed = analyzeAimPressureSignal(speculationResult.normalizedSignal!);

assert(speculationAnalyzed.evidenceClassification.verifiedTruth === false, "Speculation must not become verified truth.");
assert(speculationAnalyzed.paiSafeReadinessHandoff.readinessState === "Insufficient Evidence", "Speculation must produce Insufficient Evidence.");

const rumorInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_rumor_001",
  sourceType: "rumor",
  signalObserved: "Rumor only about compute shortage.",
  thesisNote: "Ignore until confirmed."
};

const rumorResult = normalizeManualEvidenceInput(rumorInput);
assert(rumorResult.status === "NORMALIZED", "Rumor may normalize only for tracking boundary.");
assert(rumorResult.evidenceLabel === "Rumor / Ignore", "Rumor evidence mapping failed.");

const rumorAnalyzed = analyzeAimPressureSignal(rumorResult.normalizedSignal!);
assert(rumorAnalyzed.paiSafeReadinessHandoff.readinessState !== "Review Ready", "Rumor must not produce Review Ready.");

const forbiddenInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_forbidden_001",
  thesisNote: "This is a guaranteed profit and sure winner."
};

const forbiddenResult = normalizeManualEvidenceInput(forbiddenInput);

assert(forbiddenResult.status === "REFUSED_FOR_FORBIDDEN_LANGUAGE", "Forbidden language must be refused.");
assert(forbiddenResult.normalizedSignal === null, "Forbidden language must not normalize.");

const tradeInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_trade_001",
  operatorNote: "Buy now and execute order."
};

const tradeResult = normalizeManualEvidenceInput(tradeInput);

assert(tradeResult.status === "REFUSED_FOR_TRADE_ACTION", "Trade-action language must be refused.");
assert(tradeResult.normalizedSignal === null, "Trade-action language must not normalize.");

const contradictionInput: AimManualEvidenceInput = {
  ...validInput,
  inputId: "manual_contradiction_001",
  contradictionNote: "Contradictory source undermines the dependency thesis."
};

const contradictionResult = normalizeManualEvidenceInput(contradictionInput);

assert(contradictionResult.status === "REFUSED_FOR_CONTRADICTION", "Contradiction must refuse normalized-ready state.");
assert(contradictionResult.normalizedSignal === null, "Contradiction must not produce normalized signal in Pass 2.");

console.log("AIM_PASS_2_EVIDENCE_INTAKE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "manual evidence input normalized",
      "source type mapped to evidence label",
      "normalized signal feeds Pass 1 analyzer",
      "missing fields held",
      "speculation not verified truth",
      "rumor not Review Ready",
      "forbidden certainty language refused",
      "trade-action language refused",
      "contradiction refused",
      "final action remains blank",
      "human authority remains final"
    ]
  },
  null,
  2
));