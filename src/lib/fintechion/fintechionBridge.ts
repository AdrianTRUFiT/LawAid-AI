import {
  GTIS_STATES,
  type FinTechionAnomaly,
  type HumanReviewRequestedArtifact,
  type RefusalArtifact,
  makeId,
  nowIso,
} from "../gtis/gtisContracts";

export function toFinTechionAnomaly(
  artifact: RefusalArtifact | HumanReviewRequestedArtifact
): FinTechionAnomaly {
  const reason =
    artifact.type === "RefusalArtifact"
      ? artifact.payload.refusalCode
      : artifact.payload.reviewReason;

  let severity: FinTechionAnomaly["severity"] = "low";
  let posture: FinTechionAnomaly["posture"] = "review";

  switch (reason) {
    case "REPLAY_DETECTED":
    case "DESTINATION_MISMATCH":
      severity = "high";
      posture = "escalate";
      break;
    case "AMOUNT_MISMATCH":
    case "TIMING_EXPIRED":
    case "STALE_SUBMISSION":
      severity = "medium";
      posture = "hold";
      break;
    case "CONTRADICTORY_SIGNAL":
    case "POLICY_AMBIGUITY":
      severity = "medium";
      posture = "review";
      break;
    default:
      severity = "low";
      posture = "review";
      break;
  }

  return {
    anomalyId: makeId<"ArtifactId">("anm"),
    correlationId: artifact.correlationId,
    severity,
    posture,
    sourceArtifactType: artifact.type,
    sourceState:
      artifact.type === "RefusalArtifact"
        ? GTIS_STATES.REFUSAL_ARTIFACT_ISSUED
        : GTIS_STATES.HUMAN_REVIEW_REQUIRED,
    reason,
    exposureSignals: [
      `artifact:${artifact.type}`,
      `correlation:${artifact.correlationId}`,
      `severity:${severity}`,
      `posture:${posture}`,
    ],
    createdAt: nowIso(),
  };
}
