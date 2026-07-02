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
  consumerRef: "cust_001",
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

const validSubmission = submitProcessorEvent({
  processorReference: "pi_valid_001",
  transactionId: "tx_valid_001",
  instructionId: guard.instructionId,
  merchantId: "m_201",
  amount: 125.00,
  currency: "USD",
  destinationRef: "seller_lawaidai_account",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
});

const validResult = verifyInstructionGuard(validSubmission);

const tamperedSubmission = submitProcessorEvent({
  processorReference: "pi_tampered_001",
  transactionId: "tx_tampered_001",
  instructionId: guard.instructionId,
  merchantId: "m_201",
  amount: 925.00,
  currency: "USD",
  destinationRef: "fraud_destination",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
});

const tamperedResult = verifyInstructionGuard(tamperedSubmission);

console.log("OBLIGATION_CREATED=", obligation.status);
console.log("VALID_ALLOWED=", validResult.allowed);
console.log("VALID_REASONS=", validResult.reasons.length);
console.log("TAMPERED_ALLOWED=", tamperedResult.allowed);
console.log("TAMPERED_REASON_COUNT=", tamperedResult.reasons.length);
console.log("TAMPERED_REASONS=", tamperedResult.reasons.join(","));

