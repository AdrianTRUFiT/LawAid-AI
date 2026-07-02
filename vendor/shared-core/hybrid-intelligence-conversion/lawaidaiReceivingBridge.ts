import {
  AnalogCustodyRecord,
  HICConversionPacket,
  HILDecision,
  SourceReferencePacket
} from "./hybridContracts";

export type LawAidAIReceivingInputPacket = {
  receivingInputId: string;
  createdAt: string;
  destination: "LawAidAI";
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving";
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  sourceReference: string;
  structuredSummary: string;
  receivingStatus:
    | "RECEIVING_INPUT_READY"
    | "RECEIVING_INPUT_HELD"
    | "RECEIVING_INPUT_REFUSED";
  receivingEligibility:
    | "eligible_for_lawaidai_review"
    | "held_for_review"
    | "refused";
  requiredCorrections: string[];
  boundary: {
    receivingIsNotAuthority: true;
    receivingIsNotActivation: true;
    receivingDoesNotVerifyTruth: true;
    receivingDoesNotCertifyEvidence: true;
    sourceTraceRequired: true;
    hilMustPrecedeHic: true;
    hicConversionRequired: true;
  };
  notes: string[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLawAidAIReceivingInputPacket(input: {
  custody: AnalogCustodyRecord;
  sourceReferencePacket: SourceReferencePacket;
  hilDecision: HILDecision;
  hicConversion: HICConversionPacket;
}): LawAidAIReceivingInputPacket {
  const requiredCorrections: string[] = [];

  if (input.custody.custodyStatus !== "custody_recorded") {
    requiredCorrections.push("CUSTODY_RECORD_REQUIRED");
  }

  if (input.sourceReferencePacket.packetStatus !== "source_reference_ready") {
    requiredCorrections.push("SOURCE_REFERENCE_READY_REQUIRED");
  }

  if (!input.sourceReferencePacket.eligibleForHILReview) {
    requiredCorrections.push("SOURCE_REFERENCE_HIL_ELIGIBILITY_REQUIRED");
  }

  if (input.hilDecision.layer !== "HIL" || input.hilDecision.status !== "HIL_APPROVED") {
    requiredCorrections.push("HIL_APPROVAL_REQUIRED");
  }

  if (input.hicConversion.layer !== "HIC" || input.hicConversion.status !== "HIC_CONVERTED") {
    requiredCorrections.push("HIC_CONVERSION_REQUIRED");
  }

  if (input.hicConversion.downstreamEligibility !== "eligible_for_aios") {
    requiredCorrections.push("AIOS_ELIGIBILITY_REQUIRED");
  }

  const ready = requiredCorrections.length === 0;

  return {
    receivingInputId: id("lawaidai-receiving-input"),
    createdAt: new Date().toISOString(),
    destination: "LawAidAI",
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving",
    custodyId: input.custody.custodyId,
    sourceReferencePacketId: input.sourceReferencePacket.sourceReferencePacketId,
    hilDecisionId: input.hilDecision.decisionId,
    hicConversionId: input.hicConversion.conversionId,
    sourceReference: input.sourceReferencePacket.sourceReference,
    structuredSummary: input.hicConversion.structuredSummary,
    receivingStatus: ready ? "RECEIVING_INPUT_READY" : "RECEIVING_INPUT_HELD",
    receivingEligibility: ready ? "eligible_for_lawaidai_review" : "held_for_review",
    requiredCorrections,
    boundary: {
      receivingIsNotAuthority: true,
      receivingIsNotActivation: true,
      receivingDoesNotVerifyTruth: true,
      receivingDoesNotCertifyEvidence: true,
      sourceTraceRequired: true,
      hilMustPrecedeHic: true,
      hicConversionRequired: true
    },
    notes: [
      "LawAidAI receiving input is a structured intake packet only.",
      "Presence in receiving path does not create authority.",
      "Structured input is not verified state.",
      "Receiving is not activation.",
      "All forward movement remains traceable to custody, source reference, HIL decision, and HIC conversion."
    ]
  };
}
