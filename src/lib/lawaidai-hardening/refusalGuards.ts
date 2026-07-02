import type {
  LawAidAIRefusalCode,
  LawAidAIRefusalInput,
  LawAidAIRefusalResult,
} from "./hardeningContracts";

export function evaluateLawAidAIRefusal(input: LawAidAIRefusalInput): LawAidAIRefusalResult {
  const refusalCodes: LawAidAIRefusalCode[] = [];
  const explanation: string[] = [];

  if (input.fields.targetEnvironment !== input.expectedTargetEnvironment) {
    refusalCodes.push("WRONG_TARGET");
    explanation.push("Target environment does not match the expected receiving environment.");
  }

  if (!input.hasReviewedShell) {
    refusalCodes.push("UNAPPROVED_SHELL");
    explanation.push("Reviewed shell is missing or not approved.");
  }

  if (!input.fields.matterId || !input.fields.userId || !input.fields.shellId || !input.fields.targetEnvironment) {
    refusalCodes.push("MISSING_REQUIRED_FIELD");
    explanation.push("One or more required fields are missing.");
  }

  if (input.contradictoryState) {
    refusalCodes.push("CONTRADICTORY_STATE");
    explanation.push("Contradictory governed state detected.");
  }

  if (input.isDuplicateActivation) {
    refusalCodes.push("DUPLICATE_ACTIVATION");
    explanation.push("Duplicate activation was detected.");
  }

  if (input.trapped) {
    refusalCodes.push("TRAPPED_STATE");
    explanation.push("Course state is trapped and cannot proceed.");
  }

  if (input.blocked) {
    refusalCodes.push("BLOCKED_STATE");
    explanation.push("Course state is blocked and cannot proceed.");
  }

  if (!input.hasActivatedTransactionState) {
    refusalCodes.push("MISSING_ACTIVATED_TRANSACTION_STATE");
    explanation.push("Activated Transaction State is missing.");
  }

  if (!input.financialMappingValid) {
    refusalCodes.push("FINANCIAL_MAPPING_INVALID");
    explanation.push("Financial mapping is incomplete or invalid.");
  }

  if (!input.queueReady) {
    refusalCodes.push("QUEUE_NOT_READY");
    explanation.push("Submission queue is not ready.");
  }

  if (!input.confirmationReady) {
    refusalCodes.push("CONFIRMATION_NOT_READY");
    explanation.push("Confirmation path is not ready.");
  }

  if (!input.reconciliationValid) {
    refusalCodes.push("RECONCILIATION_INVALID");
    explanation.push("Reconciliation state is invalid.");
  }

  const approved = refusalCodes.length === 0;

  return {
    decision: approved ? "approved" : "refused",
    approved,
    refusalCodes,
    explanation: approved ? ["All governed refusal checks passed."] : explanation,
  };
}
