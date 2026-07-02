export {};
const base = "http://127.0.0.1:3011";

async function main() {
  const snapshot = await fetch(`${base}/api/fundtracker/admin/snapshot`).then((res) => res.json());
  const reviewerPolicies = await fetch(`${base}/api/fundtracker/admin/reviewer-policies`).then((res) => res.json());
  const rejectedReviews = await fetch(`${base}/api/fundtracker/admin/reviews/rejected`).then((res) => res.json());
  const merchantReviews = await fetch(`${base}/api/fundtracker/admin/reviews/by-merchant/m_201`).then((res) => res.json());
  const reviewerActivity = await fetch(`${base}/api/fundtracker/admin/reviewer-activity/reviewer_alpha`).then((res) => res.json());

  let transactionTimelineCount = 0;
  if (merchantReviews.payload.length > 0) {
    const txId = merchantReviews.payload[0].transactionId;
    const transactionTimeline = await fetch(`${base}/api/fundtracker/admin/timeline/transaction/${txId}`).then((res) => res.json());
    transactionTimelineCount = transactionTimeline.payload.length;
  }

  const merchantTimeline = await fetch(`${base}/api/fundtracker/admin/timeline/merchant/m_201`).then((res) => res.json());

  console.log("SNAPSHOT_QUEUE_COUNT=", snapshot.payload.queueCount);
  console.log("SNAPSHOT_REJECTED_COUNT=", snapshot.payload.rejectedCount);
  console.log("REVIEWER_POLICY_COUNT=", reviewerPolicies.payload.length);
  console.log("REJECTED_REVIEWS_COUNT=", rejectedReviews.payload.length);
  console.log("MERCHANT_REVIEWS_COUNT=", merchantReviews.payload.length);
  console.log("REVIEWER_ALPHA_AUDITS=", reviewerActivity.payload.audits.length);
  console.log("TX_TIMELINE_COUNT=", transactionTimelineCount);
  console.log("MERCHANT_TIMELINE_COUNT=", merchantTimeline.payload.length);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

