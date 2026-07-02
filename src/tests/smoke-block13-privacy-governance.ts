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
import { getDeletionPolicy } from "../lib/privacy/deletion";
import { getPrivacyRoleAssignment } from "../lib/privacy/roles";
import { evaluateRetentionClass } from "../lib/privacy/retention";
import { buildSubjectAccessBundle } from "../lib/privacy/subjectAccess";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

resetPersistedReviewGovernanceState();
resetReviewQueue();
resetReviewAuditLog();
resetApprovedReviewRecords();

const riskyOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_block13_001",
  sourceSystem: "manual_unknown_entry",
  merchantId: "m_201",
  customerId: "cust_block13_001",
  productId: "prod_block13_001",
  productName: "Block 13 Plan",
  amount: 2300,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const riskyEvent: ProcessorEvent = {
  processorReference: "pi_block13_001",
  transactionId: "tx_vo_block13_001",
  eventType: "payment_succeeded",
  amount: 2300,
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

const retention = evaluateRetentionClass("dispute", riskyOpportunity.createdAt);
const deletion = getDeletionPolicy("ReviewQueueItem");
const roles = getPrivacyRoleAssignment("ReviewQueueItem");
const subjectBundle = buildSubjectAccessBundle("cust_block13_001");

console.log("RETENTION_ACTION=", retention.deletionAction);
console.log("DELETION_ACTION=", deletion.action);
console.log("ROLE_PRIMARY=", roles.primaryRole);
console.log("SUBJECT_QUEUE_COUNT=", subjectBundle.summary.reviewQueueCount);

