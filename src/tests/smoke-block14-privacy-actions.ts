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
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetApprovedReviewRecords();
resetPrivacyPolicyExceptions();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block14_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block14_001",
  productId: "prod_block14_001",
  productName: "Block 14 Plan",
  amount: 2400,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: "2020-01-01T00:00:00.000Z",
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block14_001",
  transactionId: "tx_vo_block14_001",
  eventType: "payment_succeeded",
  amount: 2400,
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

const redaction = applyRedactionPolicy("ReviewQueueItem", {
  reviewId: "review_tx_vo_block14_001",
  transactionId: "tx_vo_block14_001",
  merchantId: "m_201",
  customerId: "cust_block14_001",
  status: "pending_review",
  source: "refused",
  reasonSummary: "High-risk review",
});

const sweep = runRetentionSweep("2035-01-01T00:00:00.000Z");
const exportFile = exportSubjectAccessBundleToFile("cust_block14_001");

console.log("REDACTION_OK=", redaction.ok);
console.log("REDACTED_MERCHANT_ID=", redaction.payload.merchantId);
console.log("RETENTION_SWEEP_EXPIRED=", sweep.expired.length);
console.log("POLICY_EXCEPTION_COUNT=", sweep.exceptions.length);
console.log("EXPORT_FILE_OK=", Boolean(exportFile.filepath));

