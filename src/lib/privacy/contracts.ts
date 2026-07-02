import type { PrivacyEnvelope } from "./types";

export function classifyArtifact(
  artifactType: string,
  payload: Record<string, unknown>,
): PrivacyEnvelope {
  switch (artifactType) {
    case "VerifiedOpportunity":
      return {
        artifactType,
        containsDirectIdentifiers: Boolean(payload.customerId),
        containsBehavioralRiskSignals: false,
        containsFinancialSignals: true,
        containsReviewerIdentity: false,
        containsFreeText: false,
        accessClass: "restricted",
        retentionClass: "operational",
        purposes: ["transaction_verification", "fraud_prevention"],
        lawfulBasisPlaceholder: "contract",
        minimizationNotes: [
          "Store only identifiers strictly required for transaction governance.",
          "Avoid storing raw payment credentials or unnecessary profile fields.",
        ],
      };

    case "ReviewQueueItem":
      return {
        artifactType,
        containsDirectIdentifiers: true,
        containsBehavioralRiskSignals: true,
        containsFinancialSignals: true,
        containsReviewerIdentity: false,
        containsFreeText: true,
        accessClass: "sensitive",
        retentionClass: "dispute",
        purposes: ["review_governance", "fraud_prevention", "auditability"],
        lawfulBasisPlaceholder: "legitimate_interest",
        minimizationNotes: [
          "Reason summaries should avoid unnecessary personal detail.",
          "Review context should remain bounded to decision-relevant fields.",
        ],
      };

    case "ReviewAuditRecord":
      return {
        artifactType,
        containsDirectIdentifiers: false,
        containsBehavioralRiskSignals: false,
        containsFinancialSignals: false,
        containsReviewerIdentity: true,
        containsFreeText: true,
        accessClass: "restricted",
        retentionClass: "compliance",
        purposes: ["auditability", "review_governance"],
        lawfulBasisPlaceholder: "legal_obligation",
        minimizationNotes: [
          "Reviewer notes should avoid personal commentary unrelated to governance.",
        ],
      };

    case "PermanentRefusalRecord":
      return {
        artifactType,
        containsDirectIdentifiers: false,
        containsBehavioralRiskSignals: true,
        containsFinancialSignals: true,
        containsReviewerIdentity: true,
        containsFreeText: true,
        accessClass: "sensitive",
        retentionClass: "dispute",
        purposes: ["dispute_defense", "fraud_prevention", "auditability"],
        lawfulBasisPlaceholder: "legal_obligation",
        minimizationNotes: [
          "Retain refusal reasons relevant to defense and governance only.",
        ],
      };

    case "ApprovedReviewRecord":
      return {
        artifactType,
        containsDirectIdentifiers: false,
        containsBehavioralRiskSignals: false,
        containsFinancialSignals: true,
        containsReviewerIdentity: true,
        containsFreeText: true,
        accessClass: "restricted",
        retentionClass: "compliance",
        purposes: ["review_governance", "auditability", "transaction_verification"],
        lawfulBasisPlaceholder: "contract",
        minimizationNotes: [
          "Approved review storage should exclude unnecessary upstream context.",
        ],
      };

    default:
      return {
        artifactType,
        containsDirectIdentifiers: false,
        containsBehavioralRiskSignals: false,
        containsFinancialSignals: false,
        containsReviewerIdentity: false,
        containsFreeText: false,
        accessClass: "internal",
        retentionClass: "operational",
        purposes: ["admin_inspection"],
        lawfulBasisPlaceholder: "not_set",
        minimizationNotes: [
          "Unclassified artifact. Assign privacy contract before production use.",
        ],
      };
  }
}
