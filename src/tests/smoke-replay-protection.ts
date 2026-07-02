export {};
import {
  createPaymentObligation,
  mintPaymentInstructionGuard,
  resetObligationStore,
  submitProcessorEvent,
  verifyInstructionGuard,
} from "../lib/fundtracker/obligation";

resetObligationStore();

const obligation = createPaymentObligation({
  merchantId: "m_201",
  consumerRef: "cust_replay_001",
  valueStoreType: "wallet_balance",
  amount: 125.00,
  currency: "USD",
  purpose: "monthly_subscription",
  proofRequirements: ["invoice", "receipt"],
});

const guard = mintPaymentInstructionGuard({
  obligationId: obligation.obligationId,
  merchantId: obligation.merchantId,
  consumerRef: obligation.consumerRef,
  amount: obligation.amount,
  currency: obligation.currency,
  destinationRef: "seller_lawaidai_account",
});

const firstSubmission = submitProcessorEvent({
  processorReference: "pi_replay_valid_001",
  transactionId: "tx_replay_valid_001",
  instructionId: guard.instructionId,
  merchantId: "m_201",
  amount: 125.00,
  currency: "USD",
  destinationRef: "seller_lawaidai_account",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
});

const firstResult = verifyInstructionGuard(firstSubmission);

const replaySubmission = submitProcessorEvent({
  processorReference: "pi_replay_valid_001",
  transactionId: "tx_replay_valid_001",
  instructionId: guard.instructionId,
  merchantId: "m_201",
  amount: 125.00,
  currency: "USD",
  destinationRef: "seller_lawaidai_account",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
});

const replayResult = verifyInstructionGuard(replaySubmission);

console.log("FIRST_ALLOWED=", firstResult.allowed);
console.log("FIRST_REASON_COUNT=", firstResult.reasons.length);
console.log("REPLAY_ALLOWED=", replayResult.allowed);
console.log("REPLAY_REASON_COUNT=", replayResult.reasons.length);
console.log("REPLAY_REASONS=", replayResult.reasons.join(","));

