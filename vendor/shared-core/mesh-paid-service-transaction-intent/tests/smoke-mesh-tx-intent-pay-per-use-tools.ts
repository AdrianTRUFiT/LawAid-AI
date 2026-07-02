import { runMeshPaidServiceTransactionIntent } from "../src/index.js";

const result = runMeshPaidServiceTransactionIntent({
  subjectId: "tx_002",
  amountMinor: 299,
  currency: "usd",
  service: {
    serviceCatalogId: "svc_cat_002",
    subjectId: "svc_002",
    serviceCode: "WEATHER",
    category: "tools",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Tools service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_002",
    subjectId: "svc_002",
    planCode: "PAY_PER_USE",
    allowedCategories: ["communication", "tools"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "metered",
    reason: "Pay-per-use plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentClass !== "metered_intent") {
  throw new Error("Expected pay-per-use tools transaction intent.");
}

console.log("SMOKE_MESH_TX_INTENT_PAY_PER_USE_TOOLS=PASS");