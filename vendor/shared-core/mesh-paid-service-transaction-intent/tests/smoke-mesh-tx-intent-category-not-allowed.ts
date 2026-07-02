import { runMeshPaidServiceTransactionIntent } from "../src/index.js";

const result = runMeshPaidServiceTransactionIntent({
  subjectId: "tx_004",
  amountMinor: 1200,
  currency: "usd",
  service: {
    serviceCatalogId: "svc_cat_004",
    subjectId: "svc_004",
    serviceCode: "VIDEO_STREAMING",
    category: "entertainment",
    bandwidthClass: "high",
    continuityCritical: false,
    transactionalEligible: true,
    reason: "Entertainment service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_004",
    subjectId: "svc_004",
    planCode: "PAY_PER_USE",
    allowedCategories: ["communication", "tools"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "metered",
    reason: "Pay-per-use plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "CATEGORY_NOT_ALLOWED") {
  throw new Error("Expected category-not-allowed refusal.");
}

console.log("SMOKE_MESH_TX_INTENT_CATEGORY_NOT_ALLOWED=PASS");