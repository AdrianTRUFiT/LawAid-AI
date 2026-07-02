import type {
  AimBottleneckSignalSet,
  AimEvidenceLabel,
  AimPressureSignal
} from "./aimContracts.js";
import type {
  AimEvidenceNormalizationIssue,
  AimEvidenceNormalizationResult,
  AimManualEvidenceInput,
  AimManualEvidenceSourceType
} from "./aimIntakeContracts.js";

const FORBIDDEN_LANGUAGE = [
  "guaranteed profit",
  "easy money",
  "sure winner",
  "prediction certainty",
  "investment advice",
  "trade approved"
];

const TRADE_ACTION_LANGUAGE = [
  "buy now",
  "sell now",
  "execute order",
  "automatic trade",
  "place trade",
  "open position",
  "close position"
];

export function mapSourceTypeToEvidenceLabel(sourceType: AimManualEvidenceSourceType): AimEvidenceLabel {
  switch (sourceType) {
    case "public filing":
      return "Confirmed public filing";
    case "company announcement":
      return "Company announcement";
    case "reputable report":
      return "Reputable reporting";
    case "industry inference":
      return "Industry inference";
    case "speculation":
      return "Speculation";
    case "rumor":
      return "Rumor / Ignore";
    default: {
      const _exhaustive: never = sourceType;
      return _exhaustive;
    }
  }
}

function normalizeBottleneckSignals(partial: Partial<AimBottleneckSignalSet>): AimBottleneckSignalSet {
  return {
    leadTimesExpanding: partial.leadTimesExpanding === true,
    pricingPowerIncreasing: partial.pricingPowerIncreasing === true,
    capacityExpansionAnnounced: partial.capacityExpansionAnnounced === true,
    longTermAgreementsOrBacklogConfirmed: partial.longTermAgreementsOrBacklogConfirmed === true
  };
}

function includesAnyForbiddenLanguage(input: AimManualEvidenceInput, phrases: string[]): boolean {
  const searchable = [
    input.signalObserved,
    input.dependencyClaim,
    input.thesisNote,
    input.contradictionNote ?? "",
    input.operatorNote ?? ""
  ].join(" ").toLowerCase();

  return phrases.some((phrase) => searchable.includes(phrase));
}

export function validateManualEvidenceInput(input: AimManualEvidenceInput): AimEvidenceNormalizationIssue[] {
  const issues: AimEvidenceNormalizationIssue[] = [];

  if (!input.inputId || input.inputId.trim().length === 0) {
    issues.push({ code: "MISSING_INPUT_ID", field: "inputId", message: "Manual evidence input requires inputId." });
  }

  if (!input.observedAt || input.observedAt.trim().length === 0) {
    issues.push({ code: "MISSING_OBSERVED_AT", field: "observedAt", message: "Manual evidence input requires observedAt." });
  }

  if (!input.sourceName || input.sourceName.trim().length === 0) {
    issues.push({ code: "MISSING_SOURCE_NAME", field: "sourceName", message: "Manual evidence input requires sourceName." });
  }

  if (!input.signalObserved || input.signalObserved.trim().length === 0) {
    issues.push({ code: "MISSING_SIGNAL_OBSERVED", field: "signalObserved", message: "Manual evidence input requires signalObserved." });
  }

  if (!input.dependencyClaim || input.dependencyClaim.trim().length === 0) {
    issues.push({ code: "MISSING_DEPENDENCY_CLAIM", field: "dependencyClaim", message: "Manual evidence input requires dependencyClaim." });
  }

  if (!input.thesisNote || input.thesisNote.trim().length === 0) {
    issues.push({ code: "MISSING_THESIS_NOTE", field: "thesisNote", message: "Manual evidence input requires thesisNote." });
  }

  if (includesAnyForbiddenLanguage(input, FORBIDDEN_LANGUAGE)) {
    issues.push({ code: "FORBIDDEN_LANGUAGE", message: "Input contains forbidden certainty or advice language." });
  }

  if (includesAnyForbiddenLanguage(input, TRADE_ACTION_LANGUAGE)) {
    issues.push({ code: "TRADE_ACTION_LANGUAGE", message: "Input contains trade-action language." });
  }

  if (input.contradictionNote && input.contradictionNote.trim().length > 0) {
    issues.push({ code: "CONTRADICTION_PRESENT", field: "contradictionNote", message: "Contradiction requires refusal from normalized-ready state." });
  }

  return issues;
}

export function normalizeManualEvidenceInput(input: AimManualEvidenceInput): AimEvidenceNormalizationResult {
  const issues = validateManualEvidenceInput(input);
  const evidenceLabel = mapSourceTypeToEvidenceLabel(input.sourceType);

  if (issues.some((issue) => issue.code === "FORBIDDEN_LANGUAGE")) {
    return {
      status: "REFUSED_FOR_FORBIDDEN_LANGUAGE",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.some((issue) => issue.code === "TRADE_ACTION_LANGUAGE")) {
    return {
      status: "REFUSED_FOR_TRADE_ACTION",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.some((issue) => issue.code === "CONTRADICTION_PRESENT")) {
    return {
      status: "REFUSED_FOR_CONTRADICTION",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  if (issues.length > 0) {
    return {
      status: "HELD_FOR_MISSING_FIELDS",
      inputId: input.inputId,
      evidenceLabel,
      normalizedSignal: null,
      issues,
      humanReviewRequired: true,
      finalAction: ""
    };
  }

  const normalizedSignal: AimPressureSignal = {
    signalId: input.inputId,
    observedAt: input.observedAt,
    signalObserved: input.signalObserved.trim(),
    infrastructureLayer: input.infrastructureLayer,
    dependencyMapped: input.dependencyClaim.trim(),
    evidenceLabel,
    bottleneckSignals: normalizeBottleneckSignals(input.bottleneckSignals),
    chokepointSignalType: input.chokepointSignalType,
    strategicDenialEffect: input.strategicDenialEffect,
    thesisNote: input.thesisNote.trim()
  };

  return {
    status: "NORMALIZED",
    inputId: input.inputId,
    evidenceLabel,
    normalizedSignal,
    issues: [],
    humanReviewRequired: true,
    finalAction: ""
  };
}