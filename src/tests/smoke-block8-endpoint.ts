export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const riskyOpportunity = {
    verifiedOpportunityId: "vo_http_block8_001",
    sourceSystem: "manual_unknown_entry",
    merchantId: "m_201",
    customerId: "cust_http_block8_001",
    productId: "prod_http_block8_001",
    productName: "Block 8 HTTP Plan",
    offerId: "offer_http_block8_001",
    planId: "annual",
    amount: 1500,
    currency: "EUR",
    paymentMode: "card",
    destinationType: "subscription_activation",
    successRoute: "/success",
    cancelRoute: "/cancel",
    metadata: {},
    createdAt: new Date().toISOString(),
  };

  const created = await fetch(`${base}/api/fundtracker/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(riskyOpportunity),
  }).then((res) => res.json());

  const riskyEvent = {
    processorReference: "pi_http_block8_001",
    transactionId: created.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 1500,
    currency: "EUR",
    receivedAt: new Date().toISOString(),
    rawStatus: "succeeded",
    metadata: {
      rail: "manual-test-rail",
    },
  };

  const verify = await fetch(`${base}/api/fundtracker/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: created.payload,
      processorEvent: riskyEvent,
    }),
  }).then((res) => res.json());

  const reviewId = verify.reviewQueueItem.reviewId;

  const approve = await fetch(`${base}/api/fundtracker/review-queue/${reviewId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewerId: "reviewer_http_alpha",
      reviewerNote: "Approved through HTTP review flow.",
    }),
  }).then((res) => res.json());

  const auditLog = await fetch(`${base}/api/fundtracker/review-audit-log`).then((res) => res.json());

  const secondOpportunity = {
    ...riskyOpportunity,
    verifiedOpportunityId: "vo_http_block8_002",
    customerId: "cust_http_block8_002",
    productId: "prod_http_block8_002",
  };

  const secondCreated = await fetch(`${base}/api/fundtracker/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(secondOpportunity),
  }).then((res) => res.json());

  const secondEvent = {
    ...riskyEvent,
    processorReference: "pi_http_block8_002",
    transactionId: secondCreated.payload.transactionId,
  };

  const secondVerify = await fetch(`${base}/api/fundtracker/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: secondCreated.payload,
      processorEvent: secondEvent,
    }),
  }).then((res) => res.json());

  const secondReviewId = secondVerify.reviewQueueItem.reviewId;

  const reject = await fetch(`${base}/api/fundtracker/review-queue/${secondReviewId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewerId: "reviewer_http_beta",
      reviewerNote: "Rejected through HTTP review flow.",
    }),
  }).then((res) => res.json());

  const permanentRefusals = await fetch(`${base}/api/fundtracker/permanent-refusals`).then((res) => res.json());

  console.log("VERIFY_OK=", verify.ok);
  console.log("APPROVE_OK=", approve.ok);
  console.log("APPROVE_ACTION=", approve.payload.action);
  console.log("AUDIT_LOG_COUNT=", auditLog.payload.length);
  console.log("SECOND_VERIFY_OK=", secondVerify.ok);
  console.log("REJECT_OK=", reject.ok);
  console.log("REJECT_ACTION=", reject.payload.action);
  console.log("PERMANENT_REFUSAL_COUNT=", permanentRefusals.payload.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

