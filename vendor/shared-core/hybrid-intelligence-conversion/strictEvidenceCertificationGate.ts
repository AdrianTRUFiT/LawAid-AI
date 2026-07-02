import {
  EvidencePacket,
  ExternalCertificationAuthority,
  createEvidencePacketFromExternalCertification
} from "./lawaidaiEvidenceGate";
import { LawAidAIReviewPacket } from "./lawaidaiReviewGate";

export type StrictEvidenceCertificationResult = {
  resultId: string;
  createdAt: string;
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence";
  reviewPacketId: string;
  resultStatus:
    | "EVIDENCE_PACKET_CREATED"
    | "EVIDENCE_PACKET_NOT_CREATED";
  reason:
    | "VALID_EXTERNAL_CERTIFICATION"
    | "REVIEW_ALONE_CANNOT_CREATE_EVIDENCE"
    | "INVALID_EXTERNAL_CERTIFICATION"
    | "REVIEW_NOT_READY";
  evidencePacket?: EvidencePacket;
  requiredCorrections: string[];
  boundary: {
    reviewIsNotEvidence: true;
    invalidCertificationCreatesNoEvidencePacket: true;
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

export function strictEvidenceCertificationGate(input: {
  reviewPacket: LawAidAIReviewPacket;
  externalCertificationAuthority?: ExternalCertificationAuthority;
}): StrictEvidenceCertificationResult {
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

  const reviewReady = requiredCorrections.length === 0;

  if (!reviewReady) {
    return {
      resultId: id("strict-evidence-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
      reviewPacketId: reviewPacket.reviewPacketId,
      resultStatus: "EVIDENCE_PACKET_NOT_CREATED",
      reason: "REVIEW_NOT_READY",
      requiredCorrections,
      boundary: {
        reviewIsNotEvidence: true,
        invalidCertificationCreatesNoEvidencePacket: true,
        evidenceRequiresExternalAuthority: true,
        lawAidAIMayNotCertifyEvidence: true,
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        truthClaimNotCreatedInternally: true
      },
      notes: [
        "Review packet is not ready.",
        "No Evidence packet is created.",
        "Review does not create evidence, truth, action, or activation authority."
      ]
    };
  }

  if (!input.externalCertificationAuthority) {
    return {
      resultId: id("strict-evidence-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
      reviewPacketId: reviewPacket.reviewPacketId,
      resultStatus: "EVIDENCE_PACKET_NOT_CREATED",
      reason: "REVIEW_ALONE_CANNOT_CREATE_EVIDENCE",
      requiredCorrections: ["EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED"],
      boundary: {
        reviewIsNotEvidence: true,
        invalidCertificationCreatesNoEvidencePacket: true,
        evidenceRequiresExternalAuthority: true,
        lawAidAIMayNotCertifyEvidence: true,
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        truthClaimNotCreatedInternally: true
      },
      notes: [
        "Review alone cannot create Evidence.",
        "Review output is eligible for certification, not evidence itself.",
        "No Evidence packet is created without external/correct certification authority."
      ]
    };
  }

  if (!validExternalCertification(input.externalCertificationAuthority)) {
    return {
      resultId: id("strict-evidence-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
      reviewPacketId: reviewPacket.reviewPacketId,
      resultStatus: "EVIDENCE_PACKET_NOT_CREATED",
      reason: "INVALID_EXTERNAL_CERTIFICATION",
      requiredCorrections: ["VALID_EXTERNAL_CERTIFICATION_AUTHORITY_REQUIRED"],
      boundary: {
        reviewIsNotEvidence: true,
        invalidCertificationCreatesNoEvidencePacket: true,
        evidenceRequiresExternalAuthority: true,
        lawAidAIMayNotCertifyEvidence: true,
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        truthClaimNotCreatedInternally: true
      },
      notes: [
        "Invalid external certification is refused.",
        "No Evidence packet is created.",
        "Custody trace remains intact.",
        "LawAidAI does not self-certify Evidence."
      ]
    };
  }

  const evidencePacket = createEvidencePacketFromExternalCertification({
    reviewPacket,
    externalCertificationAuthority: input.externalCertificationAuthority
  });

  return {
    resultId: id("strict-evidence-result"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence",
    reviewPacketId: reviewPacket.reviewPacketId,
    resultStatus: "EVIDENCE_PACKET_CREATED",
    reason: "VALID_EXTERNAL_CERTIFICATION",
    evidencePacket,
    requiredCorrections: [],
    boundary: {
      reviewIsNotEvidence: true,
      invalidCertificationCreatesNoEvidencePacket: true,
      evidenceRequiresExternalAuthority: true,
      lawAidAIMayNotCertifyEvidence: true,
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      truthClaimNotCreatedInternally: true
    },
    notes: [
      "Valid external/correct certification authority supplied.",
      "Evidence packet created with custody lineage, source reference, and certification metadata.",
      "Evidence does not trigger Action.",
      "Action still requires proper activation authority."
    ]
  };
}
