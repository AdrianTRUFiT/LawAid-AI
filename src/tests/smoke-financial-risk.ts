export {};
import {
  assessTransactionRisk,
  createTransactionIntent,
  sampleProcessorEvent,
  sampleVerifiedOpportunity,
  verifyCommitment,
} from "../lib/fundtracker";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

const lowIntent = createTransactionIntent(sampleVerifiedOpportunity);
const lowRisk = assessTransactionRisk(lowIntent, sampleProcessorEvent);
const lowDecision = verifyCommitment(lowIntent, sampleProcessorEvent);

const highOpportunity: VerifiedOpportunity = {
  ...sampleVerifiedOpportunity,
  verifiedOpportunityId: "vo_high_001",
  sourceSystem: "manual_unknown_entry",
  amount: 1200,
  currency: "EUR",
  metadata: {},
};

const highEvent: ProcessorEvent = {
  ...sampleProcessorEvent,
  processorReference: "pi_high_001",
  transactionId: "tx_vo_high_001",
  amount: 1200,
  currency: "EUR",
  metadata: {
    rail: "manual-test-rail",
  },
};

const highIntent = createTransactionIntent(highOpportunity);
const highRisk = assessTransactionRisk(highIntent, highEvent);
const highDecision = verifyCommitment(highIntent, highEvent);

console.log("LOW_RISK_SCORE=", lowRisk.score);
console.log("LOW_RISK_LEVEL=", lowRisk.riskLevel);
console.log("LOW_DECISION_ALLOWED=", lowDecision.allowed);
console.log("LOW_DECISION_STATUS=", lowDecision.verificationStatus);

console.log("HIGH_RISK_SCORE=", highRisk.score);
console.log("HIGH_RISK_LEVEL=", highRisk.riskLevel);
console.log("HIGH_DECISION_ALLOWED=", highDecision.allowed);
console.log("HIGH_DECISION_STATUS=", highDecision.verificationStatus);
console.log("HIGH_REASON_COUNT=", highDecision.reasons.length);

