import { runMeshPaidServiceTransactionIntent } from "../src/index.js";

const result = runMeshPaidServiceTransactionIntent({
  subjectId: "tx_003",
  amountMinor: 4500,
  currency: "usd",
  service: {
    serviceCatalogId: "svc_cat_003",
    subjectId: "svc_003",
    serviceCode: "AUDIO_STREAMING",
    category: "entertainment",
    bandwidthClass: "moderate",
    continuityCritical: false,
    transactionalEligible: true,
    reason: "Entertainment service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_003",
    subjectId: "svc_003",
    planCode: "GROUP_PLAN",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "shared",
    reason: "Group plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentClass !== "shared_group_intent") {
  throw new Error("Expected group entertainment transaction intent.");
}

console.log("SMOKE_MESH_TX_INTENT_GROUP_ENTERTAINMENT=PASS");