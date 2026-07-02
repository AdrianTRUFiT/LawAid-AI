export type AnalogObservation = {
  observationId: string;
  capturedAt: string;
  capturedBy: string;
  realitySource: "human_observation" | "physical_document" | "spoken_statement" | "image" | "environmental_signal" | "other";
  summary: string;
  rawReference?: string;
  humanPresent: boolean;
  humanApprovedForConversion: boolean;
  notes?: string[];
};

export type HILDecision = {
  decisionId: string;
  observationId: string;
  decidedAt: string;
  layer: "HIL";
  status: "HIL_APPROVED" | "HIL_REFUSED";
  reason: string;
  allowedForward: boolean;
  requiredCorrections: string[];
  authorityBoundary: {
    realityFirst: true;
    computerDoesNotDecideReality: true;
    humanApprovalRequired: true;
  };
};

export type HICConversionPacket = {
  conversionId: string;
  observationId: string;
  hilDecisionId: string;
  convertedAt: string;
  layer: "HIC";
  status: "HIC_CONVERTED" | "HIC_REFUSED";
  structuredArtifactType: "CapturedSignal" | "VerifiedOpportunity" | "ReceivingInput" | "ReviewQueueItem";
  structuredSummary: string;
  downstreamEligibility: "eligible_for_aios" | "held_for_review";
  authorityBoundary: {
    hicBelowHil: true;
    conversionIsNotTruth: true;
    aiOSMayOperateOnlyAfterConversion: true;
  };
};

export type AnalogCustodyRecord = {
  custodyId: string;
  observationId: string;
  createdAt: string;
  createdBy: string;
  sourceType: "physical_document" | "image" | "spoken_statement" | "environmental_signal" | "other";
  sourceReference: string;
  storageLocation?: string;
  possessionState: "in_human_possession" | "digitally_referenced" | "held_for_review" | "unknown";
  custodyStatus: "custody_recorded" | "custody_incomplete" | "custody_refused";
  humanCustodianPresent: boolean;
  sourceDescription: string;
  limitations: string[];
  authorityBoundary: {
    custodyRecordIsNotTruth: true;
    sourceReferenceIsNotAuthority: true;
    humanCustodyRequired: true;
    aiDoesNotOwnSource: true;
  };
};

export type SourceReferencePacket = {
  sourceReferencePacketId: string;
  custodyId: string;
  observationId: string;
  createdAt: string;
  packetStatus: "source_reference_ready" | "source_reference_incomplete" | "source_reference_refused";
  sourceReference: string;
  sourceType: AnalogCustodyRecord["sourceType"];
  custodyStatus: AnalogCustodyRecord["custodyStatus"];
  eligibleForHILReview: boolean;
  requiredCorrections: string[];
  boundary: {
    packetDoesNotCertifyTruth: true;
    packetDoesNotCreateLegalEvidence: true;
    packetOnlyReferencesSource: true;
    hilMustReviewBeforeHic: true;
  };
};

export type HybridLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  observationId: string;
  hilDecisionId?: string;
  conversionId?: string;
  custodyId?: string;
  sourceReferencePacketId?: string;
  status: "recorded" | "refused" | "custody_recorded" | "source_reference_recorded";
  chain: "Reality -> HIL -> HIC -> AIOS";
  notes: string[];
};
