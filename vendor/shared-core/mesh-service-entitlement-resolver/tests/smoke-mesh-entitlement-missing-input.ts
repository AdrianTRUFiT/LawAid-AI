import { runMeshServiceEntitlementResolver } from "../src/index.js";

const result = runMeshServiceEntitlementResolver({
  subjectId: "ent_006",
  paidTruth: null,
  service: {
    serviceCatalogId: "svc_cat_006",
    subjectId: "ent_006",
    serviceCode: "MESSAGING",
    category: "communication",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Communication service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_006",
    subjectId: "ent_006",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_INPUT") {
  throw new Error("Expected missing-input refusal.");
}

console.log("SMOKE_MESH_ENTITLEMENT_MISSING_INPUT=PASS");