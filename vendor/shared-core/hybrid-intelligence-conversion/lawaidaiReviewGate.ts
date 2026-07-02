import { LawAidAIReceivingInputPacket } from "./lawaidaiReceivingBridge";

export type LawAidAIReviewPacket = {
  reviewPacketId: string;
  createdAt: string;
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review";
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  reviewStatus:
    | "REVIEW_PACKET_READY"
    | "REVIEW_PACKET_HELD"
    | "REVIEW_PACKET_REFUSED";
  reviewEligibility:
    | "eligible_for_governed_interpretation"
    | "held_for_review"
    | "refused";
  structuredSummary: string;
  requiredCorrections: string[];
  reviewScope: {
    mayInterpret: true;
    mayOrganize: true;
    mayFlagGaps: true;
    maySuggestQuestions: true;
    mayCertifyEvidence: false;
    mayTriggerAction: false;
    mayCreateActivationAuthority: false;
    mayCreateTruthClaim: false;
  };
  boundary: {
    reviewIsNotEvidence: true;
    reviewIsNotAction: true;
    reviewIsNotExternalCertification: true;
    reviewIsNotActivationAuthority: true;
    reviewDoesNotVerifyTruth: true;
    custodyTraceRequired: true;
    sourceReferenceTraceRequired: true;
    hilTraceRequired: true;
    hicTraceRequired: true;
    receivingEligibilityRequired: true;
  };
  notes: string[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createLawAidAIReviewPacket(
  receivingPacket: LawAidAIReceivingInputPacket
): LawAidAIReviewPacket {
  const requiredCorrections: string[] = [];

  if (receivingPacket.receivingStatus !== "RECEIVING_INPUT_READY") {
    requiredCorrections.push("RECEIVING_INPUT_READY_REQUIRED");
  }

  if (receivingPacket.receivingEligibility !== "eligible_for_lawaidai_review") {
    requiredCorrections.push("RECEIVING_ELIGIBILITY_REQUIRED");
  }

  if (!receivingPacket.custodyId) {
    requiredCorrections.push("CUSTODY_TRACE_REQUIRED");
  }

  if (!receivingPacket.sourceReferencePacketId) {
    requiredCorrections.push("SOURCE_REFERENCE_TRACE_REQUIRED");
  }

  if (!receivingPacket.hilDecisionId) {
    requiredCorrections.push("HIL_TRACE_REQUIRED");
  }

  if (!receivingPacket.hicConversionId) {
    requiredCorrections.push("HIC_TRACE_REQUIRED");
  }

  if (receivingPacket.boundary.receivingIsNotAuthority !== true) {
    requiredCorrections.push("RECEIVING_AUTHORITY_BOUNDARY_REQUIRED");
  }

  if (receivingPacket.boundary.receivingIsNotActivation !== true) {
    requiredCorrections.push("RECEIVING_ACTIVATION_BOUNDARY_REQUIRED");
  }

  if (receivingPacket.boundary.receivingDoesNotVerifyTruth !== true) {
    requiredCorrections.push("RECEIVING_TRUTH_BOUNDARY_REQUIRED");
  }

  if (receivingPacket.boundary.receivingDoesNotCertifyEvidence !== true) {
    requiredCorrections.push("RECEIVING_EVIDENCE_BOUNDARY_REQUIRED");
  }

  const ready = requiredCorrections.length === 0;

  return {
    reviewPacketId: id("lawaidai-review-packet"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review",
    receivingInputId: receivingPacket.receivingInputId,
    custodyId: receivingPacket.custodyId,
    sourceReferencePacketId: receivingPacket.sourceReferencePacketId,
    hilDecisionId: receivingPacket.hilDecisionId,
    hicConversionId: receivingPacket.hicConversionId,
    reviewStatus: ready ? "REVIEW_PACKET_READY" : "REVIEW_PACKET_HELD",
    reviewEligibility: ready ? "eligible_for_governed_interpretation" : "held_for_review",
    structuredSummary: receivingPacket.structuredSummary,
    requiredCorrections,
    reviewScope: {
      mayInterpret: true,
      mayOrganize: true,
      mayFlagGaps: true,
      maySuggestQuestions: true,
      mayCertifyEvidence: false,
      mayTriggerAction: false,
      mayCreateActivationAuthority: false,
      mayCreateTruthClaim: false
    },
    boundary: {
      reviewIsNotEvidence: true,
      reviewIsNotAction: true,
      reviewIsNotExternalCertification: true,
      reviewIsNotActivationAuthority: true,
      reviewDoesNotVerifyTruth: true,
      custodyTraceRequired: true,
      sourceReferenceTraceRequired: true,
      hilTraceRequired: true,
      hicTraceRequired: true,
      receivingEligibilityRequired: true
    },
    notes: [
      "LawAidAI review packet permits governed interpretation only.",
      "Review may organize, interpret, flag gaps, and suggest questions.",
      "Review does not certify evidence.",
      "Review does not trigger action.",
      "Review does not create activation authority.",
      "Review does not create truth claims.",
      "Evidence requires external/correct certification authority.",
      "Action requires the proper activation authority."
    ]
  };
}
