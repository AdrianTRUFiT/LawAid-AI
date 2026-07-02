export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const reviewerPolicies = await fetch(`${base}/api/fundtracker/admin/reviewer-policies`).then((res) => res.json());

  const riskyOpportunity = {
    verifiedOpportunityId: "vo_http_block10_001",
    sourceSystem: "manual_unknown_entry",
    merchantId: "m_201",
    customerId: "cust_http_block10_001",
    productId: "prod_http_block10_001",
    productName: "Block 10 HTTP Plan",
    offerId: "offer_http_block10_001",
    planId: "annual",
    amount: 1900,
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
    processorReference: "pi_http_block10_001",
    transactionId: created.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 1900,
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
      reviewerNote: "Approved by endpoint.",
    }),
  }).then((res) => res.json());

  const approvedReviews = await fetch(`${base}/api/fundtracker/admin/reviews/approved`).then((res) => res.json());
  const reviewEvents = await fetch(`${base}/api/fundtracker/admin/review-events`).then((res) => res.json());

  console.log("REVIEWER_POLICY_COUNT=", reviewerPolicies.payload.length);
  console.log("VERIFY_OK=", verify.ok);
  console.log("APPROVE_OK=", approve.ok);
  console.log("APPROVED_REVIEW_COUNT=", approvedReviews.payload.length);
  console.log("REVIEW_EVENT_COUNT=", reviewEvents.payload.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

