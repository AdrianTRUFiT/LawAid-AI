import type { PrivacyRetentionClass } from "./types";

export interface RetentionEvaluation {
  retentionClass: PrivacyRetentionClass;
  expiresAt: string | null;
  deletionAction: "delete" | "review" | "retain_for_obligation";
  notes: string[];
}

function addDays(base: Date, days: number): string {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}

export function evaluateRetentionClass(
  retentionClass: PrivacyRetentionClass,
  createdAt?: string,
): RetentionEvaluation {
  const base = createdAt ? new Date(createdAt) : new Date();

  switch (retentionClass) {
    case "ephemeral":
      return {
        retentionClass,
        expiresAt: addDays(base, 1),
        deletionAction: "delete",
        notes: ["Ephemeral data should be removed quickly after operational use."],
      };

    case "operational":
      return {
        retentionClass,
        expiresAt: addDays(base, 30),
        deletionAction: "review",
        notes: ["Operational data should be reviewed for continued necessity."],
      };

    case "compliance":
      return {
        retentionClass,
        expiresAt: addDays(base, 365),
        deletionAction: "retain_for_obligation",
        notes: ["Compliance records may require extended retention."],
      };

    case "dispute":
      return {
        retentionClass,
        expiresAt: addDays(base, 730),
        deletionAction: "retain_for_obligation",
        notes: ["Dispute records may need longer retention for legal defense."],
      };

    case "archival":
      return {
        retentionClass,
        expiresAt: addDays(base, 1825),
        deletionAction: "review",
        notes: ["Archival records should be periodically reassessed."],
      };

    default:
      return {
        retentionClass,
        expiresAt: null,
        deletionAction: "review",
        notes: ["Unknown retention class."],
      };
  }
}
