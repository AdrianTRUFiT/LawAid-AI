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
      consumerRef: "cust_http_replay_final_001",
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

  const firstSubmission = await fetch(`${base}/api/fundtracker/processor-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      processorReference: "pi_http_replay_final_001",
      transactionId: "tx_http_replay_final_001",
      instructionId: guard.payload.instructionId,
      merchantId: "m_201",
      amount: 125.00,
      currency: "USD",
      destinationRef: "seller_lawaidai_account",
      receivedAt: new Date().toISOString(),
      rawStatus: "succeeded",
    }),
  }).then(expectJson);

  const firstVerify = await fetch(`${base}/api/fundtracker/instruction-guards/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(firstSubmission.payload),
  }).then(expectJson);

  const replaySubmission = await fetch(`${base}/api/fundtracker/processor-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      processorReference: "pi_http_replay_final_001",
      transactionId: "tx_http_replay_final_001",
      instructionId: guard.payload.instructionId,
      merchantId: "m_201",
      amount: 125.00,
      currency: "USD",
      destinationRef: "seller_lawaidai_account",
      receivedAt: new Date().toISOString(),
      rawStatus: "succeeded",
    }),
  }).then(expectJson);

  const replayVerify = await fetch(`${base}/api/fundtracker/instruction-guards/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(replaySubmission.payload),
  }).then(expectJson);

  const consumed = await fetch(`${base}/api/fundtracker/instruction-guards/consumed`).then(expectJson);
  const results = await fetch(`${base}/api/fundtracker/instruction-guard-results`).then(expectJson);

  console.log("FIRST_VERIFY_ALLOWED=", firstVerify.payload.allowed);
  console.log("FIRST_REASON_COUNT=", firstVerify.payload.reasons.length);
  console.log("REPLAY_VERIFY_ALLOWED=", replayVerify.payload.allowed);
  console.log("REPLAY_REASON_COUNT=", replayVerify.payload.reasons.length);
  console.log("REPLAY_REASONS=", replayVerify.payload.reasons.join(","));
  console.log("CONSUMED_GUARD_COUNT=", consumed.payload.length);
  console.log("RESULT_COUNT=", results.payload.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

