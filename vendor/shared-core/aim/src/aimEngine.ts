import type {
  AimBottleneckClassification,
  AimChokepointClassification,
  AimDependencyMap,
  AimDoctrineContract,
  AimEvidenceClassification,
  AimEvidenceLabel,
  AimOutputPacket,
  AimPaiSafeReadinessHandoffPacket,
  AimPaiSafeReadinessState,
  AimPressureSignal
} from "./aimContracts.js";

export function getAimDoctrineContract(): AimDoctrineContract {
  return {
    productBrand: "AIM â€” AI MarketIntel",
    internalDoctrine: "Awareness + Infrastructure Mapping",
    publicPositioningLine: "AIM helps structure directional clarity before capital, resources, or action moves.",
    doctrineLine: "AIM detects pressure and maps dependency before PAI-SAFE tests readiness.",
    coreLoop: ["Pressure", "Dependency", "Readiness", "Consequence", "Review", "Adaptation"],
    legalBoundary: "This system is for research, education, market intelligence, portfolio organization, and scenario planning only. It does not provide financial advice, guarantee outcomes, or execute trades.",
    prohibitedBehaviors: [
      "trade recommendations",
      "buy/sell instructions",
      "brokerage execution",
      "financial advice",
      "autonomous trading",
      "portfolio automation",
      "external API calls",
      "payment movement",
      "custody",
      "S:\\SOUL writes"
    ]
  };
}

export function countTighteningSignals(signal: AimPressureSignal): number {
  const signals = signal.bottleneckSignals;
  return [
    signals.leadTimesExpanding,
    signals.pricingPowerIncreasing,
    signals.capacityExpansionAnnounced,
    signals.longTermAgreementsOrBacklogConfirmed
  ].filter(Boolean).length;
}

export function classifyEvidence(label: AimEvidenceLabel): AimEvidenceClassification {
  if (label === "Confirmed public filing" || label === "Company announcement" || label === "Reputable reporting") {
    return { label, verifiedTruth: true, reviewEligible: true, note: "Evidence is strong enough for structured review." };
  }

  if (label === "Industry inference") {
    return { label, verifiedTruth: false, reviewEligible: true, note: "Inference may support review but must be held below verified truth." };
  }

  if (label === "Speculation") {
    return { label, verifiedTruth: false, reviewEligible: false, note: "Speculation may be tracked but cannot be treated as verified truth." };
  }

  return { label, verifiedTruth: false, reviewEligible: false, note: "Rumor / Ignore must not produce Review Ready status." };
}

export function classifyBottleneckPhase(signal: AimPressureSignal): AimBottleneckClassification {
  if (signal.contradictionNote && signal.contradictionNote.trim().length > 0) {
    return { phase: "Thesis Broken", tighteningSignalCount: countTighteningSignals(signal), ruleApplied: "2-of-4 tightening rule" };
  }

  const tighteningSignalCount = countTighteningSignals(signal);

  if (tighteningSignalCount >= 2) {
    return { phase: "Tightening", tighteningSignalCount, ruleApplied: "2-of-4 tightening rule" };
  }

  return { phase: "Narrative Only â€” Not Confirmed", tighteningSignalCount, ruleApplied: "2-of-4 tightening rule" };
}

export function classifyChokepointControl(signal: AimPressureSignal): AimChokepointClassification {
  return { signalType: signal.chokepointSignalType, descriptiveOnly: true };
}

export function mapDependency(signal: AimPressureSignal): AimDependencyMap {
  return {
    signalId: signal.signalId,
    infrastructureLayer: signal.infrastructureLayer,
    dependencyMapped: signal.dependencyMapped,
    pressureDetected: signal.signalObserved.trim().length > 0,
    mappedAt: signal.observedAt
  };
}

export function derivePaiSafeReadinessState(
  evidence: AimEvidenceClassification,
  bottleneck: AimBottleneckClassification,
  signal: AimPressureSignal
): AimPaiSafeReadinessState {
  if (signal.contradictionNote && signal.contradictionNote.trim().length > 0) return "Contradiction Detected";
  if (signal.evidenceLabel === "Rumor / Ignore" || signal.evidenceLabel === "Speculation") return "Insufficient Evidence";
  if (bottleneck.phase === "Narrative Only â€” Not Confirmed") return "Hold For Confirmation";
  if (evidence.verifiedTruth && bottleneck.phase === "Tightening") return "Review Ready";
  return "Hold For Confirmation";
}

export function buildPaiSafeReadinessHandoff(
  signal: AimPressureSignal,
  evidence: AimEvidenceClassification,
  bottleneck: AimBottleneckClassification
): AimPaiSafeReadinessHandoffPacket {
  const readinessState = derivePaiSafeReadinessState(evidence, bottleneck, signal);
  return {
    source: "AIM",
    destination: "PAI-SAFE",
    readinessState,
    infrastructureLayer: signal.infrastructureLayer,
    dependencyMapped: signal.dependencyMapped,
    evidenceLabel: signal.evidenceLabel,
    bottleneckPhase: bottleneck.phase,
    humanReviewRequired: true,
    note: readinessState === "Review Ready"
      ? "Review required before capital, resources, or action moves."
      : "Hold until evidence quality and dependency mapping support review."
  };
}

export function analyzeAimPressureSignal(signal: AimPressureSignal): AimOutputPacket {
  const dependencyMap = mapDependency(signal);
  const evidenceClassification = classifyEvidence(signal.evidenceLabel);
  const bottleneckClassification = classifyBottleneckPhase(signal);
  const chokepointClassification = classifyChokepointControl(signal);
  const paiSafeReadinessHandoff = buildPaiSafeReadinessHandoff(signal, evidenceClassification, bottleneckClassification);

  return {
    productBrand: "AIM â€” AI MarketIntel",
    internalDoctrine: "Awareness + Infrastructure Mapping",
    pressureSignal: signal,
    dependencyMap,
    evidenceClassification,
    bottleneckClassification,
    chokepointClassification,
    paiSafeReadinessHandoff,
    journalReadyDecisionRecord: {
      dateTime: signal.observedAt,
      signalObserved: signal.signalObserved,
      infrastructureLayer: signal.infrastructureLayer,
      dependencyMapped: signal.dependencyMapped,
      evidenceStatus: signal.evidenceLabel,
      bottleneckPhase: bottleneckClassification.phase,
      chokepointSignalType: signal.chokepointSignalType,
      strategicDenialEffect: signal.strategicDenialEffect,
      paiSafeReadinessStatus: paiSafeReadinessHandoff.readinessState,
      thesisNote: signal.thesisNote,
      contradictionNote: signal.contradictionNote ?? "",
      humanReviewRequired: true,
      finalAction: ""
    },
    humanFinalAuthority: true,
    tradeRecommendation: null,
    executionAction: null
  };
}