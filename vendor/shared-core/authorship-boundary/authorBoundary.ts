export type AuthorUse =
  | "PROVENANCE"
  | "NARRATIVE_CONTEXT"
  | "BRAND_ORIGIN"
  | "SYSTEM_AUTHORITY"
  | "EXECUTION_AUTHORITY"
  | "TRUTH_OVERRIDE";

export function evaluateAuthorBoundary(input: {
  authorId: string;
  use: AuthorUse;
  target: string;
}) {
  if (!input.authorId) {
    return {
      decision: "REFUSE",
      reason: "AUTHOR_ID_REQUIRED"
    };
  }

  if (
    input.use === "SYSTEM_AUTHORITY" ||
    input.use === "EXECUTION_AUTHORITY" ||
    input.use === "TRUTH_OVERRIDE"
  ) {
    return {
      decision: "REFUSE",
      reason: "AUTHORSHIP_CANNOT_OVERRIDE_GOVERNANCE",
      law: "FOUNDER_IS_PROVENANCE_NOT_RUNTIME_AUTHORITY"
    };
  }

  return {
    decision: "ALLOW",
    reason: "AUTHORSHIP_BOUNDARY_VERIFIED",
    law: "AUTHORSHIP_INFORMS_PROVENANCE_ONLY"
  };
}
