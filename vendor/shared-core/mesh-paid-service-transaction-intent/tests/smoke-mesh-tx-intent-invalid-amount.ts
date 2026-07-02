import { runMeshPaidServiceTransactionIntent } from "../src/index.js";

const result = runMeshPaidServiceTransactionIntent({
  subjectId: "tx_005",
  amountMinor: 0,
  currency: "usd",
  service: {
    serviceCatalogId: "svc_cat_005",
    subjectId: "svc_005",
    serviceCode: "MESSAGING",
    category: "communication",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Communication service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_005",
    subjectId: "svc_005",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_AMOUNT") {
  throw new Error("Expected invalid-amount refusal.");
}

console.log("SMOKE_MESH_TX_INTENT_INVALID_AMOUNT=PASS");