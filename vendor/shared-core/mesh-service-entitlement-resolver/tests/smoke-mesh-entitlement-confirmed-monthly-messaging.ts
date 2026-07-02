import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_001",
  paidTruth: {
    paidTruthId: "paid_truth_001",
    subjectId: "ent_001",
    transactionIntentId: "mesh_tx_intent_ent_001_MESSAGING_MONTHLY",
    processorReference: "proc_001",
    serviceCode: "MESSAGING",
    planCode: "MONTHLY",
    amountMinor: 1500,
    currency: "USD",
    paidTruthStatus: "PAID_CONFIRMED",
    commercialTruthReady: true,
    requiresReview: false,
    reason: "Confirmed truth.",
    createdAt: new Date().toISOString(),
  },
  service: {
    serviceCatalogId: "svc_cat_001",
    subjectId: "ent_001",
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
    subjectId: "ent_001",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementStatus !== "ENTITLED_ACTIVE") {
  throw new Error("Expected confirmed monthly messaging entitlement.");
}

console.log("SMOKE_MESH_ENTITLEMENT_CONFIRMED_MONTHLY_MESSAGING=PASS");