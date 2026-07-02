export type AnomalySeverity =
  | "low"
  | "moderate"
  | "high"
  | "critical";

export type SuspicionClass =
  | "weak_signal"
  | "developing_pressure"
  | "corroborated_pressure"
  | "instability_risk"
  | "transition_risk";

export interface ObservedAnomaly {
  anomalyId: string;
  subjectId: string;
  sourceId: string;
  category: string;
  severity: AnomalySeverity;
  score: number;
  observedAt: string;
  attributes?: Record<string, unknown>;
}

export interface StructuredSuspicion {
  suspicionId: string;
  subjectId: string;
  suspicionClass: SuspicionClass;
  anomalyIds: string[];
  reason: string;
}

export interface CorroborationSet {
  subjectId: string;
  corroborationCount: number;
  sourceCount: number;
  corroborationScore: number;
}

export interface CausalPressureAssessment {
  subjectId: string;
  pressureScore: number;
  pressureClass: "low" | "guarded" | "elevated" | "high";
  boundedForecastContribution: number;
  reason: string;
}

export interface InvestigativeInferenceArtifact {
  subjectId: string;
  anomalies: ObservedAnomaly[];
  structuredSuspicion: StructuredSuspicion;
  corroborationSet: CorroborationSet;
  causalPressureAssessment: CausalPressureAssessment;
  createdAt: string;
}

export interface InvestigativeInferenceRefusal {
  refusalCode:
    | "NO_ANOMALIES"
    | "INVALID_SUBJECT"
    | "INVALID_ANOMALY_SCORE";
  refusalReason: string;
}

export interface InvestigativeInferenceResult {
  ok: boolean;
  artifact: InvestigativeInferenceArtifact | null;
  refusal: InvestigativeInferenceRefusal | null;
}