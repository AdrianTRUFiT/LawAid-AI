import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_002",
  paidTruth: {
    paidTruthId: "paid_truth_002",
    subjectId: "ent_002",
    transactionIntentId: "mesh_tx_intent_ent_002_WEATHER_PAY_PER_USE",
    processorReference: "proc_002",
    serviceCode: "WEATHER",
    planCode: "PAY_PER_USE",
    amountMinor: 299,
    currency: "USD",
    paidTruthStatus: "PAID_CONFIRMED",
    commercialTruthReady: true,
    requiresReview: false,
    reason: "Confirmed truth.",
    createdAt: new Date().toISOString(),
  },
  service: {
    serviceCatalogId: "svc_cat_002",
    subjectId: "ent_002",
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
    subjectId: "ent_002",
    planCode: "PAY_PER_USE",
    allowedCategories: ["communication", "tools"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "metered",
    reason: "Pay-per-use plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementStatus !== "ENTITLED_ACTIVE") {
  throw new Error("Expected confirmed metered tools entitlement.");
}

console.log("SMOKE_MESH_ENTITLEMENT_CONFIRMED_METERED_TOOLS=PASS");