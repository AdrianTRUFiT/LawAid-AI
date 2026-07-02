import type { CustodyClass, MemoryDestination, RedactionLevel, RetentionRule } from "./custodyClassContracts";

export interface CustodyClassDefinition {
  custodyClass: CustodyClass;
  description: string;
  defaultDestination: MemoryDestination;
  allowedSoulBaseAI: boolean;
  requiredRedactionLevel: RedactionLevel;
  requiredRetentionRule: RetentionRule;
}

export const CUSTODY_CLASS_TAXONOMY: CustodyClassDefinition[] = [
  {
    custodyClass: "CLOUD_SAFE_METADATA",
    description: "Non-sensitive operational metadata safe for cloud or interface reference.",
    defaultDestination: "SOULBASE_AI",
    allowedSoulBaseAI: true,
    requiredRedactionLevel: "NONE_REQUIRED",
    requiredRetentionRule: "USER_APPROVED_CONTINUITY"
  },
  {
    custodyClass: "RESTRICTED_CONTEXTUAL_DATA",
    description: "Reduced, coded, or contextualized data that may support continuity without exposing source truth.",
    defaultDestination: "SOULBASE_AI",
    allowedSoulBaseAI: true,
    requiredRedactionLevel: "REDACTED",
    requiredRetentionRule: "CONTAINER_BOUND"
  },
  {
    custodyClass: "DERIVED_MEMORY_PROJECTION",
    description: "A bounded memory projection derived from source material after authorization.",
    defaultDestination: "SOULBASE_AI",
    allowedSoulBaseAI: true,
    requiredRedactionLevel: "SUMMARY_ONLY",
    requiredRetentionRule: "USER_APPROVED_CONTINUITY"
  },
  {
    custodyClass: "LEDGER_SAFE_SUMMARY",
    description: "A redacted financial summary emitted from governed financial truth without raw source payload.",
    defaultDestination: "SOULBASE_AI",
    allowedSoulBaseAI: true,
    requiredRedactionLevel: "SUMMARY_ONLY",
    requiredRetentionRule: "CONTAINER_BOUND"
  },
  {
    custodyClass: "PRIVATE_SOURCE_DATA",
    description: "Original private material that must remain in custody.",
    defaultDestination: "SOULVAULT",
    allowedSoulBaseAI: false,
    requiredRedactionLevel: "SOURCE_LOCKED",
    requiredRetentionRule: "SOURCE_CUSTODY_ONLY"
  },
  {
    custodyClass: "RAW_FINANCIAL_SOURCE",
    description: "Raw bank statements, account-level financial records, or unprocessed financial source material.",
    defaultDestination: "SOULVAULT",
    allowedSoulBaseAI: false,
    requiredRedactionLevel: "SOURCE_LOCKED",
    requiredRetentionRule: "SOURCE_CUSTODY_ONLY"
  },
  {
    custodyClass: "RAW_PROCESSOR_OBJECT",
    description: "External payment processor object, callback, event payload, or rail-level object.",
    defaultDestination: "REFUSE",
    allowedSoulBaseAI: false,
    requiredRedactionLevel: "SOURCE_LOCKED",
    requiredRetentionRule: "DO_NOT_PERSIST"
  },
  {
    custodyClass: "LEGAL_EVIDENCE_FILE",
    description: "Legal evidence source material requiring custody and preservation controls.",
    defaultDestination: "SOULVAULT",
    allowedSoulBaseAI: false,
    requiredRedactionLevel: "SOURCE_LOCKED",
    requiredRetentionRule: "SOURCE_CUSTODY_ONLY"
  },
  {
    custodyClass: "UNRESTRICTED_FINANCIAL_HISTORY",
    description: "Broad financial history without bounded purpose, redaction, retention, or user-scope limit.",
    defaultDestination: "REFUSE",
    allowedSoulBaseAI: false,
    requiredRedactionLevel: "SOURCE_LOCKED",
    requiredRetentionRule: "DO_NOT_PERSIST"
  }
];

export function getCustodyClassDefinition(custodyClass: CustodyClass): CustodyClassDefinition {
  const found = CUSTODY_CLASS_TAXONOMY.find((item) => item.custodyClass === custodyClass);
  if (!found) {
    throw new Error(`UNKNOWN_CUSTODY_CLASS: ${custodyClass}`);
  }
  return found;
}






