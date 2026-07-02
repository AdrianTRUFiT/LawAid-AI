export type SoulRegistryAnchorStatus =
  | "SOULREGISTRY_ANCHOR_ACCEPTED"
  | "SOULREGISTRY_ANCHOR_REFUSED";

export type SoulRegistryReceiptStatus =
  | "SOULREGISTRY_RECEIPT_VERIFIED"
  | "SOULREGISTRY_RECEIPT_REFUSED";

export type SoulRegistryRefusalCode =
  | "PRIVATE_FIELD_EXPOSURE_REFUSED"
  | "RAW_PROJECTION_EXPOSURE_REFUSED"
  | "RAW_FINANCIAL_EXPOSURE_REFUSED"
  | "PRIVATE_CUSTODY_PATH_EXPOSURE_REFUSED"
  | "ANCHOR_HASH_MISMATCH"
  | "RECEIPT_HASH_MISMATCH"
  | "SOURCE_AUTHORITY_INVALID"
  | "DESTINATION_INVALID"
  | "LEDGER_ENTRY_HASH_MISSING"
  | "PROJECTION_HASH_MISSING"
  | "ANCHOR_ID_MISSING"
  | "RECEIPT_ID_MISSING"
  | "PUBLIC_RECEIPT_CANNOT_CREATE_AUTHORITY"
  | "REGISTRY_IS_NOT_TRANSACTION_TRUTH";

export interface PrivateProjectionAnchorSource {
  anchorSourceId: string;
  projectionId: string;
  projectionHash: string;
  ledgerEntryHash: string;
  ledgerEntryId: string;
  sourceAuthority: "FundTrackerAI";
  destination: "SoulBaseAI";
  artifactType: "FundTrackerAIToSoulBaseMemoryProjection";
  createdAt: string;
  privateCustodyPointer: string;
  containsRawProjection: boolean;
  containsRawFinancialData: boolean;
  containsPrivateSourcePath: boolean;
}

export interface SoulRegistryPublicAnchor {
  anchorId: string;
  registryName: "SoulRegistry?";
  anchorType: "PUBLIC_VERIFICATION_ANCHOR";
  projectionId: string;
  projectionHash: string;
  ledgerEntryHash: string;
  ledgerEntryId: string;
  sourceAuthority: "FundTrackerAI";
  destination: "SoulBaseAI";
  artifactType: "FundTrackerAIToSoulBaseMemoryProjection";
  createdAt: string;
  anchorHash: string;
  publicFields: {
    projectionId: string;
    projectionHash: string;
    ledgerEntryHash: string;
    ledgerEntryId: string;
    sourceAuthority: "FundTrackerAI";
    destination: "SoulBaseAI";
    artifactType: "FundTrackerAIToSoulBaseMemoryProjection";
    createdAt: string;
  };
  boundary: {
    anchorIsNotPaymentAuthority: true;
    anchorIsNotTransactionTruth: true;
    anchorIsNotCustodyTransfer: true;
    anchorExposesNoRawProjection: true;
    anchorExposesNoRawFinancialData: true;
    anchorExposesNoPrivateCustodyPath: true;
    fundTrackerAIRemainsTransactionTruth: true;
    soulBaseAIRemainsMemorySubstrate: true;
    soulVaultRemainsCustodyPlane: true;
  };
}

export interface SoulRegistryPublicReceipt {
  receiptId: string;
  receiptType: "PUBLIC_VERIFICATION_RECEIPT";
  registryName: "SoulRegistry?";
  anchorId: string;
  projectionId: string;
  projectionHash: string;
  ledgerEntryHash: string;
  anchorHash: string;
  receiptHash: string;
  issuedAt: string;
  verificationStatement: string;
  boundary: {
    receiptIsNotPaymentAuthority: true;
    receiptIsNotTransactionTruth: true;
    receiptIsNotEntitlementAuthority: true;
    receiptIsNotCustodyTransfer: true;
    receiptExposesNoRawProjection: true;
    receiptExposesNoRawFinancialData: true;
    receiptExposesNoPrivateCustodyPath: true;
  };
}

export interface SoulRegistryAnchorDecision {
  status: SoulRegistryAnchorStatus;
  accepted: boolean;
  anchor?: SoulRegistryPublicAnchor;
  receipt?: SoulRegistryPublicReceipt;
  refusalReasons: SoulRegistryRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    publicAnchorOnly: true;
    privateCustodySeparated: true;
    noRawProjectionPublished: true;
    noPaymentAuthorityCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
  };
}

export interface SoulRegistryReceiptVerificationDecision {
  status: SoulRegistryReceiptStatus;
  verified: boolean;
  refusalReasons: SoulRegistryRefusalCode[];
  anchorId: string;
  receiptId: string;
  boundary: {
    verifierIsReadOnly: true;
    verifierCreatesNoPaymentAuthority: true;
    verifierCreatesNoTransactionTruth: true;
    verifierCreatesNoCustodyTransfer: true;
  };
}


