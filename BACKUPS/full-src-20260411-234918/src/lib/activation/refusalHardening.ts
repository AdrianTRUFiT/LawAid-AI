import type {
  ActivatedTransactionState,
  ReviewedShellRecord,
  ActivationRefusalReason,
} from "./activationContract";

export interface RefusalCheckResult {
  accepted: boolean;
  refusalReason?: ActivationRefusalReason;
  details: string[];
}

function hasString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function evaluateStep7RefusalChecks(
  reviewedShell: ReviewedShellRecord | null | undefined,
  ats: ActivatedTransactionState | null | undefined,
): RefusalCheckResult {
  const details: string[] = [];

  if (!reviewedShell) {
    details.push("Reviewed shell is missing.");
    return {
      accepted: false,
      refusalReason: "MISSING_REVIEWED_SHELL",
      details,
    };
  }

  if (!ats) {
    details.push("Activated Transaction State is missing.");
    return {
      accepted: false,
      refusalReason: "MISSING_ACTIVATED_TRANSACTION_STATE",
      details,
    };
  }

  if (reviewedShell.targetApp !== "LawAidAI") {
    details.push(`Reviewed shell targetApp was ${String(reviewedShell.targetApp)}.`);
    return {
      accepted: false,
      refusalReason: "WRONG_TARGET",
      details,
    };
  }

  if (ats.targetApp !== "LawAidAI") {
    details.push(`Activated Transaction State targetApp was ${String(ats.targetApp)}.`);
    return {
      accepted: false,
      refusalReason: "WRONG_TARGET",
      details,
    };
  }

  if (reviewedShell.reviewStatus !== "approved") {
    details.push(`Reviewed shell reviewStatus was ${String(reviewedShell.reviewStatus)}.`);
    return {
      accepted: false,
      refusalReason: "UNAPPROVED_REVIEW_STATE",
      details,
    };
  }

  if (ats.artifactType !== "ActivatedTransactionState") {
    details.push(`artifactType was ${String(ats.artifactType)}.`);
    return {
      accepted: false,
      refusalReason: "STATE_CONTRADICTION",
      details,
    };
  }

  if (ats.activationPermitted !== true) {
    details.push("activationPermitted was not true.");
    return {
      accepted: false,
      refusalReason: "STATE_CONTRADICTION",
      details,
    };
  }

  if (!hasString(reviewedShell.shellRecordId)) {
    details.push("reviewedShell.shellRecordId is missing.");
    return {
      accepted: false,
      refusalReason: "MISSING_REQUIRED_FIELD",
      details,
    };
  }

  if (!hasString(ats.transactionStateId)) {
    details.push("activatedTransactionState.transactionStateId is missing.");
    return {
      accepted: false,
      refusalReason: "MISSING_REQUIRED_FIELD",
      details,
    };
  }

  details.push("All Step 7 refusal-hardening checks passed.");
  return {
    accepted: true,
    details,
  };
}