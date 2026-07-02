export interface DeletionPolicy {
  artifactType: string;
  action: "delete" | "redact" | "freeze" | "manual_review";
  rationale: string;
  fieldsToRedact: string[];
}

export function getDeletionPolicy(artifactType: string): DeletionPolicy {
  switch (artifactType) {
    case "ReviewQueueItem":
      return {
        artifactType,
        action: "redact",
        rationale: "Queue items may need operational review while minimizing identifiers.",
        fieldsToRedact: ["merchantId", "customerId"],
      };

    case "ReviewAuditRecord":
      return {
        artifactType,
        action: "manual_review",
        rationale: "Audit records may be required for accountability and legal defense.",
        fieldsToRedact: ["reviewerNote"],
      };

    case "PermanentRefusalRecord":
      return {
        artifactType,
        action: "freeze",
        rationale: "Permanent refusal records may need to be preserved for dispute defense.",
        fieldsToRedact: ["reviewerId"],
      };

    case "ApprovedReviewRecord":
      return {
        artifactType,
        action: "redact",
        rationale: "Approved review records should preserve activation truth while limiting identifiers.",
        fieldsToRedact: ["reviewerId", "reviewerNote"],
      };

    default:
      return {
        artifactType,
        action: "manual_review",
        rationale: "No explicit deletion policy defined.",
        fieldsToRedact: [],
      };
  }
}
