import {
  sampleProcessorEvent,
  sampleVerifiedOpportunity,
  processVerifiedOpportunity,
} from "./src/lib/fundtracker/index";
import {
  buildOversightState,
} from "./src/lib/fintechion/index";

const result = processVerifiedOpportunity(
  sampleVerifiedOpportunity,
  sampleProcessorEvent,
);

console.log("FUNDTRACKER_DECISION_ALLOWED=", result.decision.allowed);

if (!result.activatedTransactionState) {
  console.log("NO_ACTIVATED_TRANSACTION_STATE");
  process.exit(0);
}

const oversight = buildOversightState({
  period: "2026-04",
  transactions: [result.activatedTransactionState],
  refundExposure: 0,
  disputeExposure: 0,
});

console.log("TX_ID=", result.activatedTransactionState.transactionId);
console.log("OVERSIGHT_ID=", oversight.oversightStateId);
console.log("HEALTH=", oversight.merchantHealthState);
console.log("ANOMALY_COUNT=", oversight.anomalyFlags.length);
