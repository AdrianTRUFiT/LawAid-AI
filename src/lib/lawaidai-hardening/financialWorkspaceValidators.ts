import type {
  FinancialWorkspaceSnapshot,
  FinancialWorkspaceValidation,
  LawAidAIRefusalCode,
} from "./hardeningContracts";

export function validateFinancialWorkspace(
  snapshot: FinancialWorkspaceSnapshot
): FinancialWorkspaceValidation {
  const codes: LawAidAIRefusalCode[] = [];
  const explanation: string[] = [];

  if (!snapshot.payeeMapped || !snapshot.sourceMapped) {
    codes.push("FINANCIAL_MAPPING_INVALID");
    explanation.push("Payee/source mapping is incomplete.");
  }

  if (!snapshot.queueReady) {
    codes.push("QUEUE_NOT_READY");
    explanation.push("Queue/submission path is not ready.");
  }

  if (!snapshot.confirmationReady) {
    codes.push("CONFIRMATION_NOT_READY");
    explanation.push("Confirmation path is not ready.");
  }

  if (!snapshot.exactVsPartialReconciliationDefined) {
    codes.push("RECONCILIATION_INVALID");
    explanation.push("Exact-vs-partial reconciliation logic is not yet defined.");
  }

  if (!snapshot.anomalyPathReady) {
    explanation.push("Anomaly resolution path is not yet complete.");
  }

  return {
    valid: codes.length === 0,
    codes,
    explanation: codes.length === 0 ? ["Financial workspace boundary checks passed."] : explanation,
  };
}
