import type { ProcessorEvent, TransactionIntent } from "../../lib/fundtracker/types";
import { assessTransactionRisk } from "../../lib/fundtracker";

export function assessRiskApi(
  intent: TransactionIntent,
  processorEvent: ProcessorEvent,
) {
  const assessment = assessTransactionRisk(intent, processorEvent);

  return {
    ok: true,
    artifactType: "RiskAssessment",
    payload: assessment,
  };
}
