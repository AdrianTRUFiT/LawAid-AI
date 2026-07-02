import type {
  InvestigativeInferenceArtifact,
  InvestigativeInferenceResult,
  ObservedAnomaly,
} from "./investigativeInferenceTypes.js";
import {
  clamp01,
  nowIso,
  severityWeight,
  suspicionClassFromPressure,
  uniqueSourceCount,
} from "./investigativeInferenceUtils.js";

export function runInvestigativeInference(input: {
  subjectId: string;
  anomalies: ObservedAnomaly[];
}): InvestigativeInferenceResult {
  if (!input.subjectId || input.subjectId.trim() === "") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SUBJECT",
        refusalReason: "Investigative inference refused because subjectId is invalid.",
      },
    };
  }

  if (!input.anomalies || input.anomalies.length === 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "NO_ANOMALIES",
        refusalReason: "Investigative inference refused because no anomalies were provided.",
      },
    };
  }

  const invalidScore = input.anomalies.find(
    (x) => !Number.isFinite(x.score) || x.score < 0 || x.score > 1,
  );

  if (invalidScore) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_ANOMALY_SCORE",
        refusalReason: "Investigative inference refused because anomaly score must be between 0 and 1.",
      },
    };
  }

  const weightedSeverityTotal = input.anomalies.reduce(
    (sum, anomaly) => sum + anomaly.score * severityWeight(anomaly.severity),
    0,
  );

  const corroborationCount = input.anomalies.length;
  const sourceCount = uniqueSourceCount(input.anomalies);
  const corroborationScore = clamp01(
    weightedSeverityTotal / Math.max(1, corroborationCount) + (sourceCount - 1) * 0.1,
  );

  const pressureScore = clamp01(
    corroborationScore + (corroborationCount >= 3 ? 0.1 : 0),
  );

  const pressureClass =
    pressureScore < 0.25
      ? "low"
      : pressureScore < 0.5
        ? "guarded"
        : pressureScore < 0.75
          ? "elevated"
          : "high";

  const suspicionClass = suspicionClassFromPressure(pressureScore);

  const artifact: InvestigativeInferenceArtifact = {
    subjectId: input.subjectId,
    anomalies: input.anomalies,
    structuredSuspicion: {
      suspicionId: `suspicion_${input.subjectId}`,
      subjectId: input.subjectId,
      suspicionClass,
      anomalyIds: input.anomalies.map((x) => x.anomalyId),
      reason: `Structured suspicion created from ${corroborationCount} anomaly signal(s).`,
    },
    corroborationSet: {
      subjectId: input.subjectId,
      corroborationCount,
      sourceCount,
      corroborationScore,
    },
    causalPressureAssessment: {
      subjectId: input.subjectId,
      pressureScore,
      pressureClass,
      boundedForecastContribution: clamp01(pressureScore * 0.85),
      reason: `Pressure assessed from severity-weighted corroboration across ${sourceCount} source(s).`,
    },
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}