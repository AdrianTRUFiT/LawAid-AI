export {};
import {
  addToReviewQueue,
  createTransactionIntent,
  resetPersistedReviewGovernanceState,
  resetReviewAuditLog,
  resetReviewQueue,
  verifyCommitment,
} from "../lib/fundtracker";
import { resetApprovedReviewRecords } from "../lib/fundtracker/approvedReviewStore";
import { buildPrivacyInventory } from "../lib/privacy/inventory";
import { classifyArtifact } from "../lib/privacy/contracts";
import { sanitizeByArtifactType } from "../lib/privacy/sanitizer";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetApprovedReviewRecords();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block12_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block12_001",
  productId: "prod_block12_001",
  productName: "Block 12 Plan",
  amount: 2200,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block12_001",
  transactionId: "tx_vo_block12_001",
  eventType: "payment_succeeded",
  amount: 2200,
  currency: "EUR",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
  metadata: {
    rail: "manual-test-rail",
  },
};

const intent = createTransactionIntent(riskyOpportunity);
const decision = verifyCommitment(intent, riskyEvent);
addToReviewQueue(intent, riskyEvent, decision);

const classification = classifyArtifact(
  "ReviewQueueItem",
  {
    reviewId: "review_tx_vo_block12_001",
    transactionId: "tx_vo_block12_001",
    merchantId: "m_201",
    customerId: "cust_block12_001",
    status: "pending_review",
    source: "refused",
    reasonSummary: "High-risk review",
  },
);

const sanitized = sanitizeByArtifactType("ReviewQueueItem", {
  reviewId: "review_tx_vo_block12_001",
  transactionId: "tx_vo_block12_001",
  merchantId: "m_201",
  customerId: "cust_block12_001",
  status: "pending_review",
  source: "refused",
  reasonSummary: "High-risk review",
});

const inventory = buildPrivacyInventory();

console.log("PRIVACY_ACCESS_CLASS=", classification.accessClass);
console.log("PRIVACY_RETENTION_CLASS=", classification.retentionClass);
console.log(
  "SANITIZED_MERCHANT_ID=",
  typeof sanitized === "object" && sanitized !== null && "merchantId" in sanitized
    ? sanitized.merchantId
    : undefined
);
console.log("INVENTORY_REVIEW_QUEUE_COUNT=", inventory.summary.reviewQueueCount);


