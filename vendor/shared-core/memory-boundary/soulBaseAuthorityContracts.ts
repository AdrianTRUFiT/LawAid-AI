export type SoulBaseAuthorityStatus =
  | "SOULBASEAI_AUTHORITY_SEALED"
  | "SOULBASEAI_AUTHORITY_BLOCKED";

export type SoulBaseFunction =
  | "PERSONAL_CONTINUITY"
  | "PRIVATE_MEMORY_SUBSTRATE"
  | "AUTHORIZED_MEMORY_PROJECTION_STORAGE"
  | "USER_SIDE_PERSISTENCE"
  | "CONTEXTUAL_RECALL_SUPPORT";

export type SoulBaseProhibitedAuthority =
  | "TRANSACTION_TRUTH"
  | "PAYMENT_AUTHORITY"
  | "ENTITLEMENT_AUTHORITY"
  | "RAW_BANK_DATA_OWNER"
  | "SOURCE_CUSTODY_OWNER"
  | "FUNDTRACKER_OVERRIDE"
  | "USER_AUTHORIZATION_OVERRIDE"
  | "LEGAL_EVIDENCE_CERTIFIER"
  | "OPERATOR_FINANCIAL_OVERSIGHT";

export interface SoulBaseAuthorityDefinition {
  name: "SoulBaseAI";
  status: SoulBaseAuthorityStatus;
  role: "PERSONAL_CONTINUITY_AND_PRIVATE_MEMORY_SUBSTRATE";
  scope: "USER_SIDE_MEMORY";
  functions: SoulBaseFunction[];
  prohibitedAuthority: SoulBaseProhibitedAuthority[];
  acceptsOnly: string[];
  refusesAlways: string[];
  oneLineLock: string;
  boundary: {
    isNotTransactionTruth: true;
    isNotPaymentAuthority: true;
    isNotEntitlementAuthority: true;
    isNotCustodyPlane: true;
    isNotRawFinancialStore: true;
    isNotFundTrackerAIOverride: true;
    isNotFinTechionAIOversight: true;
    isNotLawAidAIWorkspace: true;
    isNotPAIDWalletSurface: true;
  };
}





