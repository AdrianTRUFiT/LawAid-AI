export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const redaction = await fetch(`${base}/api/privacy/redact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artifactType: "ReviewQueueItem",
      payload: {
        reviewId: "review_tx_demo",
        transactionId: "tx_demo",
        merchantId: "m_201",
        customerId: "cust_demo",
        status: "pending_review",
        source: "refused",
        reasonSummary: "High-risk review",
      },
    }),
  }).then((res) => res.json());

  const sweep = await fetch(`${base}/api/privacy/retention-sweep?referenceDate=2035-01-01T00:00:00.000Z`).then((res) => res.json());
  const exceptions = await fetch(`${base}/api/privacy/policy-exceptions`).then((res) => res.json());
  const exportFile = await fetch(`${base}/api/privacy/export-subject/cust_block14_001`).then((res) => res.json());

  console.log("REDACTION_OK=", redaction.payload.ok);
  console.log("REDACTED_MERCHANT_ID=", redaction.payload.payload.merchantId);
  console.log("SWEEP_OK=", sweep.ok);
  console.log("SWEEP_EXPIRED_COUNT=", sweep.payload.expired.length);
  console.log("EXCEPTION_COUNT=", exceptions.payload.length);
  console.log("EXPORT_OK=", exportFile.ok);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

