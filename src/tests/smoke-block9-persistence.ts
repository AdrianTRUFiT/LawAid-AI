export {};
import {
  createTransactionIntent,
  verifyCommitment,
  getPersistedReviewGovernanceState,
  resetPersistedReviewGovernanceState,
  resetReviewAuditLog,
  resetReviewQueue,
  rejectReviewQueueItem,
} from "../lib/fundtracker";
import { addToReviewQueue } from "../lib/fundtracker/reviewQueue";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block9_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block9_001",
  productId: "prod_block9_001",
  productName: "Block 9 Review Plan",
  amount: 1600,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block9_001",
  transactionId: "tx_vo_block9_001",
  eventType: "payment_succeeded",
  amount: 1600,
  currency: "EUR",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
  metadata: {
    rail: "manual-test-rail",
  },
};

const intent = createTransactionIntent(riskyOpportunity);
const decision = verifyCommitment(intent, riskyEvent);
const queueItem = addToReviewQueue(intent, riskyEvent, decision);

rejectReviewQueueItem(
  queueItem.reviewId,
  "reviewer_block9",
  "Persisted permanent refusal.",
);

const persisted = getPersistedReviewGovernanceState();

console.log("PERSISTED_QUEUE_COUNT=", persisted.reviewQueue.length);
console.log("PERSISTED_AUDIT_COUNT=", persisted.reviewAuditLog.length);
console.log("PERSISTED_REFUSAL_COUNT=", persisted.permanentRefusals.length);

