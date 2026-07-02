import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_004",
  paidTruth: {
    paidTruthId: "paid_truth_004",
    subjectId: "ent_004",
    transactionIntentId: "mesh_tx_intent_ent_004_MESSAGING_MONTHLY",
    processorReference: "proc_004",
    serviceCode: "MESSAGING",
    planCode: "MONTHLY",
    amountMinor: 1500,
    currency: "USD",
    paidTruthStatus: "PAID_REFUSED",
    commercialTruthReady: false,
    requiresReview: false,
    reason: "Refused truth.",
    createdAt: new Date().toISOString(),
  },
  service: {
    serviceCatalogId: "svc_cat_004",
    subjectId: "ent_004",
    serviceCode: "MESSAGING",
    category: "communication",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Communication service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_004",
    subjectId: "ent_004",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementStatus !== "ENTITLED_REFUSED" || result.artifact.accessClass !== "blocked") {
  throw new Error("Expected refused entitlement.");
}

console.log("SMOKE_MESH_ENTITLEMENT_REFUSED=PASS");