export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const opportunity = {
    verifiedOpportunityId: "vo_http_001",
    sourceSystem: "http_test",
    merchantId: "m_101",
    customerId: "cust_101",
    productId: "prod_101",
    productName: "HTTP Plan",
    offerId: "offer_http_001",
    planId: "monthly",
    amount: 79,
    currency: "USD",
    paymentMode: "card",
    destinationType: "subscription_activation",
    successRoute: "/success",
    cancelRoute: "/cancel",
    metadata: {
      via: "http",
    },
    createdAt: new Date().toISOString(),
  };

  const created = await fetch(`${base}/api/fundtracker/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opportunity),
  }).then((res) => res.json());

  const processorEvent = {
    processorReference: "pi_http_001",
    transactionId: created.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 79,
    currency: "USD",
    receivedAt: new Date().toISOString(),
    rawStatus: "succeeded",
    metadata: {
      rail: "http-test",
    },
  };

  const recorded = await fetch(`${base}/api/fundtracker/record-processor-event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: created.payload,
      processorEvent,
    }),
  }).then((res) => res.json());

  const verified = await fetch(`${base}/api/fundtracker/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: recorded.payload,
      processorEvent,
    }),
  }).then((res) => res.json());

  const txState = await fetch(
    `${base}/api/fundtracker/transaction/${verified.payload.transactionId}`,
  ).then((res) => res.json());

  const oversight = await fetch(`${base}/api/fintechion/build-oversight`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      period: "2026-04",
      refundExposure: 0,
      disputeExposure: 0,
    }),
  }).then((res) => res.json());

  console.log("HTTP_CREATE_OK=", created.ok);
  console.log("HTTP_RECORD_OK=", recorded.ok);
  console.log("HTTP_VERIFY_OK=", verified.ok);
  console.log("HTTP_TX_OK=", txState.ok);
  console.log("HTTP_OVERSIGHT_OK=", oversight.ok);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

