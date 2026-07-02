import type { SoulBaseAuthorityDefinition } from "./soulBaseAuthorityContracts";

export const SOULBASEAI_AUTHORITY: SoulBaseAuthorityDefinition = {
  name: "SoulBaseAI",
  status: "SOULBASEAI_AUTHORITY_SEALED",
  role: "PERSONAL_CONTINUITY_AND_PRIVATE_MEMORY_SUBSTRATE",
  scope: "USER_SIDE_MEMORY",
  functions: [
    "PERSONAL_CONTINUITY",
    "PRIVATE_MEMORY_SUBSTRATE",
    "AUTHORIZED_MEMORY_PROJECTION_STORAGE",
    "USER_SIDE_PERSISTENCE",
    "CONTEXTUAL_RECALL_SUPPORT"
  ],
  prohibitedAuthority: [
    "TRANSACTION_TRUTH",
    "PAYMENT_AUTHORITY",
    "ENTITLEMENT_AUTHORITY",
    "RAW_BANK_DATA_OWNER",
    "SOURCE_CUSTODY_OWNER",
    "FUNDTRACKER_OVERRIDE",
    "USER_AUTHORIZATION_OVERRIDE",
    "LEGAL_EVIDENCE_CERTIFIER",
    "OPERATOR_FINANCIAL_OVERSIGHT"
  ],
  acceptsOnly: [
    "authorized derived memory projections",
    "ledger-safe summaries",
    "continuity-safe financial patterns",
    "retention-bounded memory artifacts",
    "user/container-scoped references",
    "redacted contextual continuity records"
  ],
  refusesAlways: [
    "raw processor objects",
    "raw bank statements",
    "full account numbers",
    "unrestricted financial history",
    "unredacted payment methods",
    "private source documents",
    "legal evidence files",
    "external processor authority treated as truth"
  ],
  oneLineLock:
    "SoulBaseAI = personal continuity and private memory substrate. It persists authorized memory projections. It does not govern.",
  boundary: {
    isNotTransactionTruth: true,
    isNotPaymentAuthority: true,
    isNotEntitlementAuthority: true,
    isNotCustodyPlane: true,
    isNotRawFinancialStore: true,
    isNotFundTrackerAIOverride: true,
    isNotFinTechionAIOversight: true,
    isNotLawAidAIWorkspace: true,
    isNotPAIDWalletSurface: true
  }
};





