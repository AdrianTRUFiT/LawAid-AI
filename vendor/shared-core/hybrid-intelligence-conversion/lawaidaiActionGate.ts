import { EvidencePacket } from "./lawaidaiEvidenceGate";

export type ActionActivationAuthority = {
  authorityId: string;
  stewardName: string;
  stewardRole:
    | "user"
    | "case_owner"
    | "attorney"
    | "court_officer"
    | "administrator"
    | "authorized_human_steward";
  authorityLevel:
    | "none"
    | "review_only"
    | "activation_allowed"
    | "final_action_authority";
  activatedAt: string;
  explicitActivation: boolean;
  activationScope: string;
  activationReference: string;
  valid: boolean;
  notes?: string[];
};

export type ActionPacket = {
  actionPacketId: string;
  createdAt: string;
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action";
  evidencePacketId: string;
  reviewPacketId: string;
  receivingInputId: string;
  custodyId: string;
  sourceReferencePacketId: string;
  hilDecisionId: string;
  hicConversionId: string;
  actionStatus: "ACTION_CREATED";
  actionEligibility: "activated_by_proper_authority";
  activationAuthority: ActionActivationAuthority;
  boundary: {
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
    properHumanStewardRequired: true;
    correctRoleRequired: true;
    correctAuthorityLevelRequired: true;
    explicitActivationRequired: true;
    actionDoesNotCreateTruth: true;
    actionDoesNotCertifyEvidence: true;
  };
  notes: string[];
};

export type ActionGateResult = {
  resultId: string;
  createdAt: string;
  sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action";
  resultStatus: "ACTION_PACKET_CREATED" | "ACTION_PACKET_NOT_CREATED";
  reason:
    | "NO_EVIDENCE_PACKET"
    | "EVIDENCE_NOT_CERTIFIED"
    | "ACTIVATION_AUTHORITY_REQUIRED"
    | "INVALID_ACTIVATION_AUTHORITY"
    | "ACTION_CREATED_BY_PROPER_AUTHORITY";
  evidencePacketId?: string;
  actionPacket?: ActionPacket;
  requiredCorrections: string[];
  boundary: {
    evidenceDoesNotTriggerAction: true;
    actionRequiresActivationAuthority: true;
    noEvidenceBypass: true;
    noAuthorityBypass: true;
    humanActivationRequired: true;
    actionDoesNotCreateTruth: true;
    actionDoesNotCertifyEvidence: true;
  };
  notes: string[];
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validActivationAuthority(authority?: ActionActivationAuthority) {
  if (!authority) return false;
  if (!authority.valid) return false;
  if (!authority.authorityId || authority.authorityId.trim().length < 3) return false;
  if (!authority.stewardName || authority.stewardName.trim().length < 3) return false;
  if (!authority.stewardRole) return false;
  if (authority.authorityLevel !== "activation_allowed" && authority.authorityLevel !== "final_action_authority") return false;
  if (!authority.explicitActivation) return false;
  if (!authority.activatedAt) return false;
  if (!authority.activationScope || authority.activationScope.trim().length < 8) return false;
  if (!authority.activationReference || authority.activationReference.trim().length < 3) return false;
  return true;
}

export function actionActivationGate(input: {
  evidencePacket?: EvidencePacket;
  activationAuthority?: ActionActivationAuthority;
}): ActionGateResult {
  const requiredCorrections: string[] = [];

  if (!input.evidencePacket) {
    return {
      resultId: id("action-gate-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
      resultStatus: "ACTION_PACKET_NOT_CREATED",
      reason: "NO_EVIDENCE_PACKET",
      requiredCorrections: ["CERTIFIED_EVIDENCE_PACKET_REQUIRED"],
      boundary: {
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        noEvidenceBypass: true,
        noAuthorityBypass: true,
        humanActivationRequired: true,
        actionDoesNotCreateTruth: true,
        actionDoesNotCertifyEvidence: true
      },
      notes: [
        "No Evidence packet was provided.",
        "Action cannot be created without certified Evidence.",
        "No Evidence packet can bypass activation authority."
      ]
    };
  }

  const evidencePacket = input.evidencePacket;

  if (
    evidencePacket.evidenceStatus !== "EVIDENCE_CERTIFIED" ||
    evidencePacket.evidenceEligibility !== "eligible_for_action_review" ||
    evidencePacket.externalCertificationPresent !== true
  ) {
    return {
      resultId: id("action-gate-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
      resultStatus: "ACTION_PACKET_NOT_CREATED",
      reason: "EVIDENCE_NOT_CERTIFIED",
      evidencePacketId: evidencePacket.evidencePacketId,
      requiredCorrections: ["CERTIFIED_EVIDENCE_REQUIRED"],
      boundary: {
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        noEvidenceBypass: true,
        noAuthorityBypass: true,
        humanActivationRequired: true,
        actionDoesNotCreateTruth: true,
        actionDoesNotCertifyEvidence: true
      },
      notes: [
        "Evidence is not certified or not eligible for action review.",
        "Uncertified Evidence cannot create Action.",
        "Evidence remains non-activating by default."
      ]
    };
  }

  if (!input.activationAuthority) {
    return {
      resultId: id("action-gate-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
      resultStatus: "ACTION_PACKET_NOT_CREATED",
      reason: "ACTIVATION_AUTHORITY_REQUIRED",
      evidencePacketId: evidencePacket.evidencePacketId,
      requiredCorrections: ["PROPER_ACTIVATION_AUTHORITY_REQUIRED"],
      boundary: {
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        noEvidenceBypass: true,
        noAuthorityBypass: true,
        humanActivationRequired: true,
        actionDoesNotCreateTruth: true,
        actionDoesNotCertifyEvidence: true
      },
      notes: [
        "Certified Evidence is eligible for action review only.",
        "Certified Evidence does not trigger Action.",
        "Proper activation authority is required."
      ]
    };
  }

  if (!validActivationAuthority(input.activationAuthority)) {
    return {
      resultId: id("action-gate-result"),
      createdAt: new Date().toISOString(),
      sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
      resultStatus: "ACTION_PACKET_NOT_CREATED",
      reason: "INVALID_ACTIVATION_AUTHORITY",
      evidencePacketId: evidencePacket.evidencePacketId,
      requiredCorrections: ["VALID_HUMAN_ACTIVATION_AUTHORITY_REQUIRED"],
      boundary: {
        evidenceDoesNotTriggerAction: true,
        actionRequiresActivationAuthority: true,
        noEvidenceBypass: true,
        noAuthorityBypass: true,
        humanActivationRequired: true,
        actionDoesNotCreateTruth: true,
        actionDoesNotCertifyEvidence: true
      },
      notes: [
        "Activation authority is invalid, incomplete, or insufficient.",
        "Action is refused.",
        "Correct human steward, role, authority level, scope, and explicit activation are required."
      ]
    };
  }

  const actionPacket: ActionPacket = {
    actionPacketId: id("action-packet"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
    evidencePacketId: evidencePacket.evidencePacketId,
    reviewPacketId: evidencePacket.reviewPacketId,
    receivingInputId: evidencePacket.receivingInputId,
    custodyId: evidencePacket.custodyId,
    sourceReferencePacketId: evidencePacket.sourceReferencePacketId,
    hilDecisionId: evidencePacket.hilDecisionId,
    hicConversionId: evidencePacket.hicConversionId,
    actionStatus: "ACTION_CREATED",
    actionEligibility: "activated_by_proper_authority",
    activationAuthority: input.activationAuthority,
    boundary: {
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      properHumanStewardRequired: true,
      correctRoleRequired: true,
      correctAuthorityLevelRequired: true,
      explicitActivationRequired: true,
      actionDoesNotCreateTruth: true,
      actionDoesNotCertifyEvidence: true
    },
    notes: [
      "Action packet was created only after certified Evidence and valid activation authority.",
      "Action preserves custody, source reference, HIL, HIC, receiving, review, and evidence trace.",
      "Action does not create truth.",
      "Action does not certify evidence."
    ]
  };

  return {
    resultId: id("action-gate-result"),
    createdAt: new Date().toISOString(),
    sourceChain: "Reality -> HIL -> HIC -> LawAidAI Receiving -> LawAidAI Review -> Evidence -> Action",
    resultStatus: "ACTION_PACKET_CREATED",
    reason: "ACTION_CREATED_BY_PROPER_AUTHORITY",
    evidencePacketId: evidencePacket.evidencePacketId,
    actionPacket,
    requiredCorrections,
    boundary: {
      evidenceDoesNotTriggerAction: true,
      actionRequiresActivationAuthority: true,
      noEvidenceBypass: true,
      noAuthorityBypass: true,
      humanActivationRequired: true,
      actionDoesNotCreateTruth: true,
      actionDoesNotCertifyEvidence: true
    },
    notes: [
      "Certified Evidence plus proper activation authority created an Action packet.",
      "Evidence did not trigger Action automatically.",
      "Activation was explicit and authority-bounded."
    ]
  };
}
