export {};
const base = "http://127.0.0.1:3011";

async function main() {
  await fetch(`${base}/api/privacy/chargeback-holds/reset`, { method: "POST" }).then((res) => res.json());
  await fetch(`${base}/api/privacy/action-receipts/reset`, { method: "POST" }).then((res) => res.json());
  await fetch(`${base}/api/privacy/approval-queue/reset`, { method: "POST" }).then((res) => res.json());

  const hold = await fetch(`${base}/api/privacy/chargeback-holds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transactionId: "tx_vo_block15_001",
      reason: "Chargeback dispute opened.",
      artifactType: "ReviewQueueItem",
    }),
  }).then((res) => res.json());

  const blockedRedaction = await fetch(`${base}/api/privacy/redact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      artifactType: "ReviewQueueItem",
      payload: {
        reviewId: "review_tx_vo_block15_001",
        transactionId: "tx_vo_block15_001",
        merchantId: "m_201",
        customerId: "cust_block15_001",
        status: "pending_review",
        source: "refused",
        reasonSummary: "High-risk review",
      },
    }),
  }).then((res) => res.json());

  const receipts = await fetch(`${base}/api/privacy/action-receipts`).then((res) => res.json());
  const holds = await fetch(`${base}/api/privacy/chargeback-holds`).then((res) => res.json());
  const snapshot = await fetch(`${base}/api/privacy/dashboard-snapshot`).then((res) => res.json());

  console.log("HOLD_OK=", hold.ok);
  console.log("BLOCKED_REDACTION_OK=", blockedRedaction.payload.ok);
  console.log("BLOCKED_BY_HOLD=", blockedRedaction.payload.blockedByChargebackHold ?? false);
  console.log("RECEIPT_COUNT=", receipts.payload.length);
  console.log("ACTIVE_HOLD_COUNT=", holds.payload.filter((x) => x.status === "active").length);
  console.log("SNAPSHOT_ACTIVE_HOLDS=", snapshot.payload.activeChargebackHoldCount);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

