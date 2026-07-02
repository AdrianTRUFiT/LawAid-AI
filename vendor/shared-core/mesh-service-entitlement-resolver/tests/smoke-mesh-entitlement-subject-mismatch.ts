import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_005",
  paidTruth: {
    paidTruthId: "paid_truth_005",
    subjectId: "wrong_ent",
    transactionIntentId: "mesh_tx_intent_ent_005_MESSAGING_MONTHLY",
    processorReference: "proc_005",
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
    serviceCatalogId: "svc_cat_005",
    subjectId: "ent_005",
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
    subjectId: "ent_005",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_MESH_ENTITLEMENT_SUBJECT_MISMATCH=PASS");