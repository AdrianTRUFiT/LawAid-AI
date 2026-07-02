export type PartnerAdapterStatus =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "REVIEW_HELD"
  | "APPROVED_FOR_TEST"
  | "APPROVED_FOR_PRODUCTION"
  | "ACTIVE"
  | "RETIRED"
  | "SUPERSEDED";

export type PartnerAdapterKind =
  | "payment_processor"
  | "legal_service"
  | "insurance_provider"
  | "travel_provider"
  | "document_provider"
  | "identity_provider"
  | "storage_provider"
  | "communication_provider"
  | "marketplace_partner"
  | "other";

export type PartnerAdapterPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type PartnerConnectionMode =
  | "manual"
  | "api"
  | "webhook"
  | "file_exchange"
  | "embedded_widget"
  | "affiliate_link"
  | "hybrid";

export type PartnerAuthorityBoundary = {
  partnerAdapterIsNotAuthority: true;
  partnerAdapterIsNotTrustProof: true;
  partnerAdapterIsNotTransactionTruth: true;
  partnerAdapterIsNotActivationApproval: true;
  partnerAdapterIsNotProductCommitment: true;
  partnerPresenceDoesNotCreatePermission: true;
  partnerOutputRequiresGovernedVerification: true;
};

export type PartnerAdapterCapability = {
  capabilityId: string;
  label: string;
  description: string;
  connectionMode: PartnerConnectionMode;
  requiresCredential: boolean;
  requiresWebhookSecret: boolean;
  emitsExternalEvent: boolean;
  receivesInternalEvent: boolean;
  notes?: string[];
};

export type PartnerAdapterDefinition = {
  partnerAdapterId: string;
  partnerName: string;
  adapterName: string;
  adapterKind: PartnerAdapterKind;
  status: PartnerAdapterStatus;
  priority: PartnerAdapterPriority;
  summary: string;
  relatedModules: string[];
  connectionModes: PartnerConnectionMode[];
  capabilities: PartnerAdapterCapability[];
  permissions: string[];
  constraints: string[];
  dependencies: string[];
  futureTrigger?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: PartnerAuthorityBoundary;
};

export type PartnerAdapterValidationResult = {
  validationId: string;
  partnerAdapterId: string;
  checkedAt: string;
  valid: boolean;
  blockedReasons: string[];
  nextAllowedStatus:
    | "READY_FOR_REVIEW"
    | "REVIEW_HELD"
    | "NO_STATUS_CHANGE";
  authorityBoundary: PartnerAuthorityBoundary & {
    validationIsNotApproval: true;
    validationIsNotConnection: true;
  };
};

export type PartnerAdapterUseGuardResult = {
  useGuardId: string;
  partnerAdapterId: string;
  checkedAt: string;
  allowed: boolean;
  reason:
    | "APPROVED_ADAPTER_CAN_SURFACE_FOR_TEST"
    | "APPROVED_ADAPTER_CAN_SURFACE_FOR_PRODUCTION"
    | "DRAFT_ADAPTER_CANNOT_CONNECT"
    | "REVIEW_HELD_ADAPTER_CANNOT_CONNECT"
    | "RETIRED_ADAPTER_CANNOT_CONNECT"
    | "SUPERSEDED_ADAPTER_CANNOT_CONNECT"
    | "ADAPTER_NOT_APPROVED_FOR_USE";
  requiredCorrections: string[];
  authorityBoundary: PartnerAuthorityBoundary & {
    useGuardIsNotExecution: true;
    useGuardIsNotActivation: true;
    useGuardIsNotTransactionTruth: true;
  };
};

export type PartnerAdapterLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "PARTNER_ADAPTER_REGISTERED"
    | "PARTNER_ADAPTER_VALIDATED"
    | "PARTNER_ADAPTER_USE_GUARD_CHECKED";
  partnerAdapterId: string;
  status: PartnerAdapterStatus;
  ledgerPath: string;
  notes: string[];
};
