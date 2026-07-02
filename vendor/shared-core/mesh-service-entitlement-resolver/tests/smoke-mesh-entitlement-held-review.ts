import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_003",
  paidTruth: {
    paidTruthId: "paid_truth_003",
    subjectId: "ent_003",
    transactionIntentId: "mesh_tx_intent_ent_003_AUDIO_STREAMING_GROUP_PLAN",
    processorReference: "proc_003",
    serviceCode: "AUDIO_STREAMING",
    planCode: "GROUP_PLAN",
    amountMinor: 4500,
    currency: "USD",
    paidTruthStatus: "PAID_HELD_REVIEW",
    commercialTruthReady: false,
    requiresReview: true,
    reason: "Held truth.",
    createdAt: new Date().toISOString(),
  },
  service: {
    serviceCatalogId: "svc_cat_003",
    subjectId: "ent_003",
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
    subjectId: "ent_003",
    planCode: "GROUP_PLAN",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "shared",
    reason: "Group plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.entitlementStatus !== "ENTITLED_HELD_REVIEW" || result.artifact.accessClass !== "held") {
  throw new Error("Expected held review entitlement.");
}

console.log("SMOKE_MESH_ENTITLEMENT_HELD_REVIEW=PASS");