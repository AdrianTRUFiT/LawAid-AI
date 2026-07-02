import { runMeshPaidServiceTransactionIntent } from "../src/index.js";

const result = runMeshPaidServiceTransactionIntent({
  subjectId: "tx_001",
  amountMinor: 1500,
  currency: "usd",
  service: {
    serviceCatalogId: "svc_cat_001",
    subjectId: "svc_001",
    serviceCode: "MESSAGING",
    category: "communication",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Communication-grade service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_001",
    subjectId: "svc_001",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentClass !== "subscription_intent") {
  throw new Error("Expected monthly messaging transaction intent.");
}

console.log("SMOKE_MESH_TX_INTENT_MONTHLY_MESSAGING=PASS");