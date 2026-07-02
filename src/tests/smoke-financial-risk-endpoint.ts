export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const lowOpportunity = {
    verifiedOpportunityId: "vo_http_low_001",
    sourceSystem: "merchant_portal",
    merchantId: "m_201",
    customerId: "cust_201",
    productId: "prod_201",
    productName: "Low Risk Plan",
    offerId: "offer_http_low_001",
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

  const lowCreated = await fetch(`${base}/api/fundtracker/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lowOpportunity),
  }).then((res) => res.json());

  const lowProcessorEvent = {
    processorReference: "pi_http_low_001",
    transactionId: lowCreated.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 79,
    currency: "USD",
    receivedAt: new Date().toISOString(),
    rawStatus: "succeeded",
    metadata: {
      rail: "stripe",
    },
  };

  const lowRisk = await fetch(`${base}/api/fundtracker/assess-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: lowCreated.payload,
      processorEvent: lowProcessorEvent,
    }),
  }).then((res) => res.json());

  const highOpportunity = {
    verifiedOpportunityId: "vo_http_high_001",
    sourceSystem: "manual_unknown_entry",
    merchantId: "m_202",
    customerId: "cust_202",
    productId: "prod_202",
    productName: "High Risk Plan",
    offerId: "offer_http_high_001",
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

  const highCreated = await fetch(`${base}/api/fundtracker/create-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(highOpportunity),
  }).then((res) => res.json());

  const highProcessorEvent = {
    processorReference: "pi_http_high_001",
    transactionId: highCreated.payload.transactionId,
    eventType: "payment_succeeded",
    amount: 1500,
    currency: "EUR",
    receivedAt: new Date().toISOString(),
    rawStatus: "succeeded",
    metadata: {
      rail: "manual-test-rail",
    },
  };

  const highRisk = await fetch(`${base}/api/fundtracker/assess-risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: highCreated.payload,
      processorEvent: highProcessorEvent,
    }),
  }).then((res) => res.json());

  const highVerify = await fetch(`${base}/api/fundtracker/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: highCreated.payload,
      processorEvent: highProcessorEvent,
    }),
  }).then((res) => res.json());

  console.log("LOW_HTTP_RISK_OK=", lowRisk.ok);
  console.log("LOW_HTTP_RISK_LEVEL=", lowRisk.payload.riskLevel);
  console.log("HIGH_HTTP_RISK_OK=", highRisk.ok);
  console.log("HIGH_HTTP_RISK_LEVEL=", highRisk.payload.riskLevel);
  console.log("HIGH_HTTP_VERIFY_OK=", highVerify.ok);
  console.log("HIGH_HTTP_VERIFY_STATUS=", highVerify.payload.verificationStatus);
}

