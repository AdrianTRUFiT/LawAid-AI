import { AnalogObservation, HICConversionPacket, HILDecision } from "./hybridContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function convertHILApprovedObservation(
  observation: AnalogObservation,
  decision: HILDecision
): HICConversionPacket {
  if (decision.layer !== "HIL") {
    return {
      conversionId: id("hic-refusal"),
      observationId: observation.observationId,
      hilDecisionId: decision.decisionId,
      convertedAt: new Date().toISOString(),
      layer: "HIC",
      status: "HIC_REFUSED",
      structuredArtifactType: "ReviewQueueItem",
      structuredSummary: "Conversion refused because upstream decision was not issued by HIL.",
      downstreamEligibility: "held_for_review",
      authorityBoundary: {
        hicBelowHil: true,
        conversionIsNotTruth: true,
        aiOSMayOperateOnlyAfterConversion: true
      }
    };
  }

  if (!decision.allowedForward || decision.status !== "HIL_APPROVED") {
    return {
      conversionId: id("hic-refusal"),
      observationId: observation.observationId,
      hilDecisionId: decision.decisionId,
      convertedAt: new Date().toISOString(),
      layer: "HIC",
      status: "HIC_REFUSED",
      structuredArtifactType: "ReviewQueueItem",
      structuredSummary: "Conversion refused because HIL did not approve the analog observation.",
      downstreamEligibility: "held_for_review",
      authorityBoundary: {
        hicBelowHil: true,
        conversionIsNotTruth: true,
        aiOSMayOperateOnlyAfterConversion: true
      }
    };
  }

  return {
    conversionId: id("hic-conversion"),
    observationId: observation.observationId,
    hilDecisionId: decision.decisionId,
    convertedAt: new Date().toISOString(),
    layer: "HIC",
    status: "HIC_CONVERTED",
    structuredArtifactType: "CapturedSignal",
    structuredSummary: observation.summary.trim(),
    downstreamEligibility: "eligible_for_aios",
    authorityBoundary: {
      hicBelowHil: true,
      conversionIsNotTruth: true,
      aiOSMayOperateOnlyAfterConversion: true
    }
  };
}
