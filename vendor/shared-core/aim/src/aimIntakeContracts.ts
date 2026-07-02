import type {
  AimChokepointControlSignalType,
  AimEvidenceLabel,
  AimInfrastructureLayer,
  AimStrategicDenialEffect,
  AimBottleneckSignalSet,
  AimPressureSignal
} from "./aimContracts.js";

export type AimManualEvidenceSourceType =
  | "public filing"
  | "company announcement"
  | "reputable report"
  | "industry inference"
  | "speculation"
  | "rumor";

export type AimIntakeStatus =
  | "NORMALIZED"
  | "HELD_FOR_MISSING_FIELDS"
  | "REFUSED_FOR_FORBIDDEN_LANGUAGE"
  | "REFUSED_FOR_TRADE_ACTION"
  | "REFUSED_FOR_INVALID_SOURCE"
  | "REFUSED_FOR_CONTRADICTION";

export interface AimManualEvidenceInput {
  inputId: string;
  observedAt: string;
  sourceType: AimManualEvidenceSourceType;
  sourceName: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyClaim: string;
  bottleneckSignals: Partial<AimBottleneckSignalSet>;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  thesisNote: string;
  contradictionNote?: string;
  operatorNote?: string;
}

export interface AimEvidenceNormalizationIssue {
  code:
    | "MISSING_INPUT_ID"
    | "MISSING_OBSERVED_AT"
    | "MISSING_SOURCE_NAME"
    | "MISSING_SIGNAL_OBSERVED"
    | "MISSING_DEPENDENCY_CLAIM"
    | "MISSING_THESIS_NOTE"
    | "FORBIDDEN_LANGUAGE"
    | "TRADE_ACTION_LANGUAGE"
    | "INVALID_SOURCE_TYPE"
    | "CONTRADICTION_PRESENT";
  field?: keyof AimManualEvidenceInput;
  message: string;
}

export interface AimEvidenceNormalizationResult {
  status: AimIntakeStatus;
  inputId: string;
  evidenceLabel: AimEvidenceLabel | null;
  normalizedSignal: AimPressureSignal | null;
  issues: AimEvidenceNormalizationIssue[];
  humanReviewRequired: true;
  finalAction: "";
}