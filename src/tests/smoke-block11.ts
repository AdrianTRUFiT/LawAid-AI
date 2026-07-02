export {};
import {
  addToReviewQueue,
  approveReviewQueueItem,
  buildAdminSnapshot,
  buildMerchantTimeline,
  buildTransactionTimeline,
  createTransactionIntent,
  findReviewsByMerchant,
  findReviewsByStatus,
  getReviewEventHistory,
  rejectReviewQueueItem,
  resetPersistedReviewGovernanceState,
  resetReviewAuditLog,
  resetReviewEventHistory,
  resetReviewQueue,
  verifyCommitment,
} from "../lib/fundtracker";
import { resetApprovedReviewRecords } from "../lib/fundtracker/approvedReviewStore";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetReviewEventHistory();
resetApprovedReviewRecords();

const baseOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block11_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block11_001",
  productId: "prod_block11_001",
  productName: "Block 11 Plan",
  amount: 2100,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const baseEvent: ProcessorEvent = {
  processorReference: "pi_block11_001",
  transactionId: "tx_vo_block11_001",
  eventType: "payment_succeeded",
  amount: 2100,
  currency: "EUR",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
  metadata: {
    rail: "manual-test-rail",
  },
};

const intent1 = createTransactionIntent(baseOpportunity);
const decision1 = verifyCommitment(intent1, baseEvent);
const review1 = addToReviewQueue(intent1, baseEvent, decision1);
rejectReviewQueueItem(review1.reviewId, "reviewer_beta", "Rejected in block 11.");

const intent2 = createTransactionIntent({
  ...baseOpportunity,
  verifiedOpportunityId: "vo_block11_002",
  customerId: "cust_block11_002",
});
const event2 = {
  ...baseEvent,
  processorReference: "pi_block11_002",
  transactionId: "tx_vo_block11_002",
};
const decision2 = verifyCommitment(intent2, event2);
const review2 = addToReviewQueue(intent2, event2, decision2);
approveReviewQueueItem(review2.reviewId, "reviewer_alpha", "Approved in block 11.");

const snapshot = buildAdminSnapshot();
const merchantReviews = findReviewsByMerchant("m_201");
const rejectedReviews = findReviewsByStatus("rejected");
const txTimeline = buildTransactionTimeline("tx_vo_block11_002");
const merchantTimeline = buildMerchantTimeline("m_201");

console.log("SNAPSHOT_QUEUE_COUNT=", snapshot.queueCount);
console.log("SNAPSHOT_APPROVED_COUNT=", snapshot.approvedCount);
console.log("SNAPSHOT_REJECTED_COUNT=", snapshot.rejectedCount);
console.log("MERCHANT_REVIEW_COUNT=", merchantReviews.length);
console.log("REJECTED_REVIEW_COUNT=", rejectedReviews.length);
console.log("TX_TIMELINE_COUNT=", txTimeline.length);
console.log("MERCHANT_TIMELINE_COUNT=", merchantTimeline.length);
console.log("REVIEW_EVENT_COUNT=", getReviewEventHistory().length);

