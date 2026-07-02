export {};
const base = "http://127.0.0.1:3011";

async function main() {
  await fetch(`${base}/api/fundtracker/review-governance-reset`, {
    method: "POST",
  }).then((res) => res.json());

  const riskyOpportunity = {
    verifiedOpportunityId: "vo_http_block9_001",
    sourceSystem: "manual_unknown_entry",
    merchantId: "m_201",
    customerId: "cust_http_block9_001",
    productId: "prod_http_block9_001",
    productName: "Block 9 HTTP Plan",
    offerId: "offer_http_block9_001",
    planId: "annual",
    amount: 1700,
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
    processorReference: "pi_http_block9_001",
    transactionId: created.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 1700,
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

  const reject = await fetch(`${base}/api/fundtracker/review-queue/${reviewId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reviewerId: "reviewer_http_block9",
      reviewerNote: "Persist this refusal.",
    }),
  }).then((res) => res.json());

  const governanceState = await fetch(`${base}/api/fundtracker/review-governance-state`).then((res) => res.json());

  console.log("VERIFY_OK=", verify.ok);
  console.log("REJECT_OK=", reject.ok);
  console.log("GOVERNANCE_QUEUE_COUNT=", governanceState.payload.reviewQueue.length);
  console.log("GOVERNANCE_AUDIT_COUNT=", governanceState.payload.reviewAuditLog.length);
  console.log("GOVERNANCE_REFUSAL_COUNT=", governanceState.payload.permanentRefusals.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

