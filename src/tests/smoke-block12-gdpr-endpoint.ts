export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const inventory = await fetch(`${base}/api/privacy/inventory`).then((res) => res.json());

  const classification = await fetch(`${base}/api/privacy/classify`, {
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

  const sanitized = await fetch(`${base}/api/privacy/sanitize-preview`, {
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

  console.log("INVENTORY_OK=", inventory.ok);
  console.log("INVENTORY_REVIEW_QUEUE_COUNT=", inventory.payload.summary.reviewQueueCount);
  console.log("CLASSIFICATION_ACCESS_CLASS=", classification.payload.accessClass);
  console.log("CLASSIFICATION_RETENTION_CLASS=", classification.payload.retentionClass);
  console.log("SANITIZED_PREVIEW_OK=", sanitized.ok);
  console.log("SANITIZED_MERCHANT_ID=", sanitized.payload.merchantId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

