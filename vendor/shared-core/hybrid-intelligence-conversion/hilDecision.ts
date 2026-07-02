import { AnalogObservation, HILDecision } from "./hybridContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function evaluateHILObservation(observation: AnalogObservation): HILDecision {
  const corrections: string[] = [];

  if (!observation.humanPresent) corrections.push("HUMAN_PRESENCE_REQUIRED");
  if (!observation.humanApprovedForConversion) corrections.push("HUMAN_APPROVAL_REQUIRED");
  if (!observation.summary || observation.summary.trim().length < 8) corrections.push("OBSERVATION_SUMMARY_REQUIRED");
  if (!observation.realitySource) corrections.push("REALITY_SOURCE_REQUIRED");

  const approved = corrections.length === 0;

  return {
    decisionId: id("hil-decision"),
    observationId: observation.observationId,
    decidedAt: new Date().toISOString(),
    layer: "HIL",
    status: approved ? "HIL_APPROVED" : "HIL_REFUSED",
    reason: approved
      ? "Reality observation approved by HIL for hybrid conversion."
      : "Reality observation refused by HIL. HIC cannot convert unapproved reality.",
    allowedForward: approved,
    requiredCorrections: corrections,
    authorityBoundary: {
      realityFirst: true,
      computerDoesNotDecideReality: true,
      humanApprovalRequired: true
    }
  };
}
