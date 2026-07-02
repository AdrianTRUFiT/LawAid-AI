export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const storedPolicyPayload = {
    merchantId: "m_777",
    profileName: "lucky-seven-custom",
    highAmountThreshold: 750,
    nonUsdWeight: 12,
    missingMetadataWeight: 8,
    suspiciousRailWeight: 10,
    highRiskSourceWeight: 18,
    mediumRiskMin: 30,
    highRiskMin: 55,
    criticalRiskMin: 85,
    allowTestRails: false,
    allowNonUsd: true
  };

  const storedWrite = await fetch(`${base}/api/fundtracker/stored-merchant-policy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(storedPolicyPayload),
  }).then((res) => res.json());

  const storedList = await fetch(`${base}/api/fundtracker/stored-merchant-policies`).then((res) => res.json());

  const riskyOpportunity = {
    verifiedOpportunityId: "vo_http_lucky7_001",
    sourceSystem: "manual_unknown_entry",
    merchantId: "m_201",
    customerId: "cust_http_lucky7_001",
    productId: "prod_http_lucky7_001",
    productName: "Lucky 7 HTTP Plan",
    offerId: "offer_http_lucky7_001",
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
    processorReference: "pi_http_lucky7_001",
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

  const reviewQueue = await fetch(`${base}/api/fundtracker/review-queue`).then((res) => res.json());

  const reviewItem = reviewQueue.payload[0];

  const reviewUpdate = await fetch(`${base}/api/fundtracker/review-queue/${reviewItem.reviewId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "approved",
    }),
  }).then((res) => res.json());

  const enforcement = await fetch(`${base}/api/fintechion/enforcement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      oversightStateId: "ofs_http_lucky7_001",
      period: "2026-04",
      sourceSystems: ["FundTrackerAI"],
      grossRevenue: 1000,
      netRevenue: 700,
      feeExposure: 300,
      refundExposure: 1200,
      disputeExposure: 800,
      anomalyFlags: [
        { code: "REFUND_EXPOSURE", message: "Refund exposure high", severity: "high" },
        { code: "DISPUTE_EXPOSURE", message: "Dispute exposure high", severity: "high" }
      ],
      complianceFlags: [],
      merchantHealthState: "at-risk",
      recommendedActions: ["Review account", "Restrict processing"],
      generatedAt: new Date().toISOString(),
    }),
  }).then((res) => res.json());

  console.log("STORED_WRITE_OK=", storedWrite.ok);
  console.log("STORED_LIST_COUNT=", storedList.payload.length);
  console.log("VERIFY_OK=", verify.ok);
  console.log("REVIEW_QUEUE_COUNT=", reviewQueue.payload.length);
  console.log("REVIEW_UPDATE_STATUS=", reviewUpdate.payload.status);
  console.log("ENFORCEMENT_ACTION=", enforcement.payload.action);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

