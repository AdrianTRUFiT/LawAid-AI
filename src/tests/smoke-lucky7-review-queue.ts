export {};
import {
  createTransactionIntent,
  verifyCommitment,
} from "../lib/fundtracker";
import { addToReviewQueue, getReviewQueue, updateReviewQueueStatus } from "../lib/fundtracker/reviewQueue";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_lucky7_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_lucky7_001",
  productId: "prod_lucky7_001",
  productName: "Lucky 7 Review Plan",
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
  processorReference: "pi_lucky7_001",
  transactionId: "tx_vo_lucky7_001",
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
const queueBefore = getReviewQueue();
const updated = updateReviewQueueStatus(queueItem.reviewId, "approved");
const queueAfter = getReviewQueue();

console.log("QUEUE_INITIAL_SIZE=", queueBefore.length);
console.log("QUEUE_ITEM_STATUS_BEFORE=", queueItem.status);
console.log("QUEUE_ITEM_STATUS_AFTER=", updated?.status ?? "missing");
console.log("QUEUE_FINAL_SIZE=", queueAfter.length);

