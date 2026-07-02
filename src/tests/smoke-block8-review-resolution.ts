export {};
import {
  createTransactionIntent,
  verifyCommitment,
  approveReviewQueueItem,
  getFundTrackerArtifacts,
  getPermanentRefusals,
  getReviewAuditLog,
  getReviewQueue,
  rejectReviewQueueItem,
  resetFundTrackerArtifacts,
  resetReviewAuditLog,
  resetReviewQueue,
} from "../lib/fundtracker";
import { addToReviewQueue } from "../lib/fundtracker/reviewQueue";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetFundTrackerArtifacts();
resetReviewQueue();
resetReviewAuditLog();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block8_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block8_001",
  productId: "prod_block8_001",
  productName: "Block 8 Review Plan",
  amount: 1400,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block8_001",
  transactionId: "tx_vo_block8_001",
  eventType: "payment_succeeded",
  amount: 1400,
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

const approval = approveReviewQueueItem(
  queueItem.reviewId,
  "reviewer_alpha",
  "Manual approval after review.",
);

const artifactsAfterApproval = getFundTrackerArtifacts();

const secondIntent = createTransactionIntent({
  ...riskyOpportunity,
  verifiedOpportunityId: "vo_block8_002",
});
const secondEvent = {
  ...riskyEvent,
  processorReference: "pi_block8_002",
  transactionId: "tx_vo_block8_002",
};
const secondDecision = verifyCommitment(secondIntent, secondEvent);
const secondQueueItem = addToReviewQueue(secondIntent, secondEvent, secondDecision);

const rejection = rejectReviewQueueItem(
  secondQueueItem.reviewId,
  "reviewer_beta",
  "Permanent refusal confirmed.",
);

console.log("APPROVAL_ACTION=", approval?.action ?? "missing");
console.log("APPROVAL_TX_ACTIVATED=", artifactsAfterApproval.activatedTransactionStates.length);
console.log("REJECTION_ACTION=", rejection?.action ?? "missing");
console.log("AUDIT_LOG_COUNT=", getReviewAuditLog().length);
console.log("PERMANENT_REFUSAL_COUNT=", getPermanentRefusals().length);
console.log("QUEUE_SIZE=", getReviewQueue().length);

