export {};
import {
  addToReviewQueue,
  approveReviewQueueItem,
  createTransactionIntent,
  getReviewEventHistory,
  listReviewerPolicies,
  rejectReviewQueueItem,
  resetPersistedReviewGovernanceState,
  resetReviewAuditLog,
  resetReviewEventHistory,
  resetReviewQueue,
  verifyCommitment,
} from "../lib/fundtracker";
import { getApprovedReviewRecords, resetApprovedReviewRecords } from "../lib/fundtracker/approvedReviewStore";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetReviewEventHistory();
resetApprovedReviewRecords();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block10_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block10_001",
  productId: "prod_block10_001",
  productName: "Block 10 Plan",
  amount: 1800,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block10_001",
  transactionId: "tx_vo_block10_001",
  eventType: "payment_succeeded",
  amount: 1800,
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
const rejection = rejectReviewQueueItem(
  queueItem.reviewId,
  "reviewer_beta",
  "Rejected by authorized reviewer.",
);

const secondIntent = createTransactionIntent({
  ...riskyOpportunity,
  verifiedOpportunityId: "vo_block10_002",
});
const secondEvent = {
  ...riskyEvent,
  processorReference: "pi_block10_002",
  transactionId: "tx_vo_block10_002",
};
const secondDecision = verifyCommitment(secondIntent, secondEvent);
const secondQueueItem = addToReviewQueue(secondIntent, secondEvent, secondDecision);
const approval = approveReviewQueueItem(
  secondQueueItem.reviewId,
  "reviewer_alpha",
  "Approved by authorized reviewer.",
);

console.log("REJECTION_ACTION=", rejection?.action ?? "missing");
console.log("APPROVAL_ACTION=", approval?.action ?? "missing");
console.log("APPROVED_RECORD_COUNT=", getApprovedReviewRecords().length);
console.log("REVIEW_EVENT_COUNT=", getReviewEventHistory().length);
console.log("REVIEWER_POLICY_COUNT=", listReviewerPolicies().length);

