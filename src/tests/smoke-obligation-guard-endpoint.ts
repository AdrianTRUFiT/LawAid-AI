export {};
const base = "http://127.0.0.1:3011";

async function expectJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON but received: ${text.slice(0, 200)}`);
  }
}

async function main() {
  const obligation = await fetch(`${base}/api/fundtracker/obligations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId: "m_201",
      consumerRef: "cust_http_001",
      valueStoreType: "wallet_balance",
      amount: 125.00,
      currency: "USD",
      purpose: "monthly_subscription",
      proofRequirements: ["invoice", "receipt"],
    }),
  }).then(expectJson);

  const guard = await fetch(`${base}/api/fundtracker/instruction-guards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      obligationId: obligation.payload.obligationId,
      merchantId: obligation.payload.merchantId,
      consumerRef: obligation.payload.consumerRef,
      amount: obligation.payload.amount,
      currency: obligation.payload.currency,
      destinationRef: "seller_lawaidai_account",
    }),
  }).then(expectJson);

  const validSubmission = await fetch(`${base}/api/fundtracker/processor-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      processorReference: "pi_http_valid_001",
      transactionId: "tx_http_valid_001",
      instructionId: guard.payload.instructionId,
      merchantId: "m_201",
      amount: 125.00,
      currency: "USD",
      destinationRef: "seller_lawaidai_account",
      receivedAt: new Date().toISOString(),
      rawStatus: "succeeded",
    }),
  }).then(expectJson);

  const validVerify = await fetch(`${base}/api/fundtracker/instruction-guards/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validSubmission.payload),
  }).then(expectJson);

  const tamperedSubmission = await fetch(`${base}/api/fundtracker/processor-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      processorReference: "pi_http_tampered_001",
      transactionId: "tx_http_tampered_001",
      instructionId: guard.payload.instructionId,
      merchantId: "m_201",
      amount: 925.00,
      currency: "USD",
      destinationRef: "fraud_destination",
      receivedAt: new Date().toISOString(),
      rawStatus: "succeeded",
    }),
  }).then(expectJson);

  const tamperedVerify = await fetch(`${base}/api/fundtracker/instruction-guards/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tamperedSubmission.payload),
  }).then(expectJson);

  const obligations = await fetch(`${base}/api/fundtracker/obligations`).then(expectJson);
  const guards = await fetch(`${base}/api/fundtracker/instruction-guards`).then(expectJson);
  const results = await fetch(`${base}/api/fundtracker/instruction-guard-results`).then(expectJson);

  console.log("OBLIGATION_POST_OK=", obligation.ok);
  console.log("GUARD_POST_OK=", guard.ok);
  console.log("VALID_VERIFY_ALLOWED=", validVerify.payload.allowed);
  console.log("TAMPERED_VERIFY_ALLOWED=", tamperedVerify.payload.allowed);
  console.log("TAMPERED_VERIFY_REASON_COUNT=", tamperedVerify.payload.reasons.length);
  console.log("OBLIGATION_COUNT=", obligations.payload.length);
  console.log("GUARD_COUNT=", guards.payload.length);
  console.log("RESULT_COUNT=", results.payload.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

