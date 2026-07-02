import { AnalogObservation, HILDecision, SourceReferencePacket } from "./hybridContracts";
import { evaluateHILObservation } from "./hilDecision";

export function evaluateSourceReferencedObservation(
  observation: AnalogObservation,
  packet: SourceReferencePacket
): HILDecision {
  if (!packet.eligibleForHILReview || packet.packetStatus !== "source_reference_ready") {
    return {
      decisionId: `hil-refusal-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      observationId: observation.observationId,
      decidedAt: new Date().toISOString(),
      layer: "HIL",
      status: "HIL_REFUSED",
      reason: "Source reference packet is not eligible for HIL review. HIC cannot convert.",
      allowedForward: false,
      requiredCorrections: packet.requiredCorrections.length > 0
        ? packet.requiredCorrections
        : ["SOURCE_REFERENCE_PACKET_NOT_READY"],
      authorityBoundary: {
        realityFirst: true,
        computerDoesNotDecideReality: true,
        humanApprovalRequired: true
      }
    };
  }

  return evaluateHILObservation(observation);
}
