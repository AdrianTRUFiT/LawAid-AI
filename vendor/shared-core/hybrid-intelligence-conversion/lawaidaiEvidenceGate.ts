import { LawAidAIReviewPacket } from "./lawaidaiReviewGate";

export type ExternalCertificationAuthority = {
  authorityId: string;
  authorityType:
    | "court"
    | "attorney"
    | "notary"
    | "agency"
    | "licensed_professional"
    | "designated_certifying_body"
    | "custodian_of_records"
    | "qualified_external_reviewer"
    | "other";
  authorityName: string;
  certifiedAt: string;
  certificationScope: string;
  certificationReference: string;
  valid: boolean;
  notes?: string[];
};

export type EvidencePacket = {
  evidencePacketId: string;
  createdAt: string;
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence";
  reviewPacketId: string;
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  evidenceStatus:
    | "EVIDENCE_CERTIFIED"
    | "EVIDENCE_REFUSED"
    | "EVIDENCE_HELD_FOR_EXTERNAL_CERTIFICATION";
  evidenceEligibility:
    | "eligible_for_action_review"
    | "held_for_external_certification"
    | "refused";
  externalCertificationRequired: true;
  externalCertificationPresent: boolean;
  externalCertificationAuthority?: ExternalCertificationAuthority;
  requiredCorrections: string[];
  boundary: {
    reviewIsNotEvidence: true;
    evidenceRequiresExternalAuthority: true;
    lawAidAIMayNotCertifyEvidence: true;
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
    truthClaimNotCreatedInternally: true;
  };
  notes: string[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validExternalCertification(authority?: ExternalCertificationAuthority) {
  if (!authority) return false;
  if (!authority.valid) return false;
  if (!authority.authorityId || authority.authorityId.trim().length < 3) return false;
  if (!authority.authorityName || authority.authorityName.trim().length < 3) return false;
  if (!authority.authorityType) return false;
  if (!authority.certifiedAt) return false;
  if (!authority.certificationScope || authority.certificationScope.trim().length < 8) return false;
  if (!authority.certificationReference || authority.certificationReference.trim().length < 3) return false;
  return true;
}

export function refuseReviewAsEvidence(reviewPacket: LawAidAIReviewPacket): EvidencePacket {
  const requiredCorrections: string[] = [];

  if (reviewPacket.reviewStatus !== "REVIEW_PACKET_READY") {
    requiredCorrections.push("REVIEW_PACKET_READY_REQUIRED");
  }

  if (reviewPacket.reviewEligibility !== "eligible_for_governed_interpretation") {
    requiredCorrections.push("REVIEW_ELIGIBILITY_REQUIRED");
  }

  requiredCorrections.push("EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED");

  return {
    evidencePacketId: id("evidence-refusal"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
    reviewPacketId: reviewPacket.reviewPacketId,
    receivingInputId: reviewPacket.receivingInputId,
    custodyId: reviewPacket.custodyId,
    sourceReferencePacketId: reviewPacket.sourceReferencePacketId,
    hilDecisionId: reviewPacket.hilDecisionId,
    hicConversionId: reviewPacket.hicConversionId,
    evidenceStatus: "EVIDENCE_HELD_FOR_EXTERNAL_CERTIFICATION",
    evidenceEligibility: "held_for_external_certification",
    externalCertificationRequired: true,
    externalCertificationPresent: false,
    requiredCorrections,
    boundary: {
      reviewIsNotEvidence: true,
      evidenceRequiresExternalAuthority: true,
      lawAidAIMayNotCertifyEvidence: true,
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      truthClaimNotCreatedInternally: true
    },
    notes: [
      "LawAidAI Review cannot create Evidence.",
      "Governed interpretation is not evidence certification.",
      "Evidence requires external/correct certification authority.",
      "Evidence status does not trigger action.",
      "Action requires proper activation authority."
    ]
  };
}

export function createEvidencePacketFromExternalCertification(input: {
  reviewPacket: LawAidAIReviewPacket;
  externalCertificationAuthority?: ExternalCertificationAuthority;
}): EvidencePacket {
  const reviewPacket = input.reviewPacket;
  const requiredCorrections: string[] = [];

  if (reviewPacket.reviewStatus !== "REVIEW_PACKET_READY") {
    requiredCorrections.push("REVIEW_PACKET_READY_REQUIRED");
  }

  if (reviewPacket.reviewEligibility !== "eligible_for_governed_interpretation") {
    requiredCorrections.push("REVIEW_ELIGIBILITY_REQUIRED");
  }

  if (reviewPacket.reviewScope.mayCertifyEvidence !== false) {
    requiredCorrections.push("REVIEW_SCOPE_MUST_NOT_CERTIFY_EVIDENCE");
  }

  if (reviewPacket.boundary.reviewIsNotEvidence !== true) {
    requiredCorrections.push("REVIEW_NOT_EVIDENCE_BOUNDARY_REQUIRED");
  }

  if (!validExternalCertification(input.externalCertificationAuthority)) {
    requiredCorrections.push("VALID_EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED");
  }

  const certified = requiredCorrections.length === 0;

  return {
    evidencePacketId: id(certified ? "evidence-certified" : "evidence-refusal"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
    reviewPacketId: reviewPacket.reviewPacketId,
    receivingInputId: reviewPacket.receivingInputId,
    custodyId: reviewPacket.custodyId,
    sourceReferencePacketId: reviewPacket.sourceReferencePacketId,
    hilDecisionId: reviewPacket.hilDecisionId,
    hicConversionId: reviewPacket.hicConversionId,
    evidenceStatus: certified ? "EVIDENCE_CERTIFIED" : "EVIDENCE_REFUSED",
    evidenceEligibility: certified ? "eligible_for_action_review" : "refused",
    externalCertificationRequired: true,
    externalCertificationPresent: certified,
    externalCertificationAuthority: input.externalCertificationAuthority,
    requiredCorrections,
    boundary: {
      reviewIsNotEvidence: true,
      evidenceRequiresExternalAuthority: true,
      lawAidAIMayNotCertifyEvidence: true,
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      truthClaimNotCreatedInternally: true
    },
    notes: certified
      ? [
          "Evidence packet references external/correct certification authority.",
          "LawAidAI did not certify evidence internally.",
          "Evidence packet is eligible for later action review only.",
          "Evidence does not trigger action.",
          "Action requires proper activation authority."
        ]
      : [
          "Evidence packet refused because required certification or boundaries were missing.",
          "LawAidAI Review cannot create Evidence.",
          "Evidence requires external/correct certification authority."
        ]
  };
}
