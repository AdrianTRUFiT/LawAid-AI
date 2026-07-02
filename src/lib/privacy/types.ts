export type PrivacyAccessClass =
  | "public"
  | "internal"
  | "restricted"
  | "sensitive";

export type PrivacyRetentionClass =
  | "ephemeral"
  | "operational"
  | "compliance"
  | "dispute"
  | "archival";

export type PrivacyPurpose =
  | "transaction_verification"
  | "review_governance"
  | "fraud_prevention"
  | "auditability"
  | "dispute_defense"
  | "admin_inspection";

export interface PrivacyEnvelope {
  artifactType: string;
  containsDirectIdentifiers: boolean;
  containsBehavioralRiskSignals: boolean;
  containsFinancialSignals: boolean;
  containsReviewerIdentity: boolean;
  containsFreeText: boolean;
  accessClass: PrivacyAccessClass;
  retentionClass: PrivacyRetentionClass;
  purposes: PrivacyPurpose[];
  lawfulBasisPlaceholder:
    | "contract"
    | "legitimate_interest"
    | "legal_obligation"
    | "consent"
    | "not_set";
  minimizationNotes: string[];
}
