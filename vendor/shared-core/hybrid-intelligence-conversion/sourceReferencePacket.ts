import { AnalogCustodyRecord, SourceReferencePacket } from "./hybridContracts";
import { custodyAllowsSourceReference } from "./analogCustody";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSourceReferencePacket(custody: AnalogCustodyRecord): SourceReferencePacket {
  const requiredCorrections: string[] = [];

  if (!custody.custodyId) requiredCorrections.push("CUSTODY_ID_REQUIRED");
  if (!custody.observationId) requiredCorrections.push("OBSERVATION_ID_REQUIRED");
  if (!custody.sourceReference) requiredCorrections.push("SOURCE_REFERENCE_REQUIRED");
  if (custody.custodyStatus !== "custody_recorded") requiredCorrections.push("CUSTODY_RECORD_NOT_COMPLETE");
  if (!custody.humanCustodianPresent) requiredCorrections.push("HUMAN_CUSTODIAN_REQUIRED");

  const eligible = requiredCorrections.length === 0 && custodyAllowsSourceReference(custody);

  return {
    sourceReferencePacketId: id("source-reference"),
    custodyId: custody.custodyId,
    observationId: custody.observationId,
    createdAt: new Date().toISOString(),
    packetStatus: eligible ? "source_reference_ready" : "source_reference_incomplete",
    sourceReference: custody.sourceReference,
    sourceType: custody.sourceType,
    custodyStatus: custody.custodyStatus,
    eligibleForHILReview: eligible,
    requiredCorrections,
    boundary: {
      packetDoesNotCertifyTruth: true,
      packetDoesNotCreateLegalEvidence: true,
      packetOnlyReferencesSource: true,
      hilMustReviewBeforeHic: true
    }
  };
}
