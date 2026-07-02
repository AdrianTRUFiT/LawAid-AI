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
import {
  applyRedactionPolicy,
  exportSubjectAccessBundleToFile,
  resetPrivacyPolicyExceptions,
  runRetentionSweep,
} from "../lib/privacy/actions";
import {
  buildPrivacyDashboardSnapshot,
  createChargebackHold,
  getPrivacyActionReceipts,
  getPrivacyApprovalQueue,
  resetChargebackHolds,
  resetPrivacyActionReceipts,
  resetPrivacyApprovalQueue,
} from "../lib/privacy/governance";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetApprovedReviewRecords();
resetPrivacyPolicyExceptions();
resetPrivacyActionReceipts();
resetPrivacyApprovalQueue();
resetChargebackHolds();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block15_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block15_001",
  productId: "prod_block15_001",
  productName: "Block 15 Plan",
  amount: 2500,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: "2020-01-01T00:00:00.000Z",
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block15_001",
  transactionId: "tx_vo_block15_001",
  eventType: "payment_succeeded",
  amount: 2500,
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

createChargebackHold(
  "tx_vo_block15_001",
  "Chargeback dispute opened.",
  "ReviewQueueItem",
);

const blockedRedaction = applyRedactionPolicy("ReviewQueueItem", {
  reviewId: "review_tx_vo_block15_001",
  transactionId: "tx_vo_block15_001",
  merchantId: "m_201",
  customerId: "cust_block15_001",
  status: "pending_review",
  source: "refused",
  reasonSummary: "High-risk review",
});

const sweep = runRetentionSweep("2035-01-01T00:00:00.000Z");
const exportFile = exportSubjectAccessBundleToFile("cust_block15_001");
const snapshot = buildPrivacyDashboardSnapshot();

console.log("BLOCKED_REDACTION_OK=", blockedRedaction.ok);
console.log("BLOCKED_BY_HOLD=", blockedRedaction.blockedByChargebackHold ?? false);
console.log("SWEEP_EXPIRED_COUNT=", sweep.expired.length);
console.log("RECEIPT_COUNT=", getPrivacyActionReceipts().length);
console.log("APPROVAL_QUEUE_COUNT=", getPrivacyApprovalQueue().length);
console.log("DASHBOARD_ACTIVE_HOLDS=", snapshot.activeChargebackHoldCount);
console.log("EXPORT_OK=", Boolean(exportFile.filepath));

