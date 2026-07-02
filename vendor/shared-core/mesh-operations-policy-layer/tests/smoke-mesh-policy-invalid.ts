import { runMeshOperationsPolicy } from "../src/index.js";

const result = runMeshOperationsPolicy({
  subjectId: "pol_005",
  networkLoadPercent: 20,
  service: {
    serviceCatalogId: "svc_cat_005",
    subjectId: "svc_005",
    serviceCode: "VIDEO_STREAMING",
    category: "entertainment",
    bandwidthClass: "high",
    continuityCritical: false,
    transactionalEligible: true,
    reason: "Entertainment service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_005",
    subjectId: "svc_005",
    planCode: "PAY_PER_USE",
    allowedCategories: ["communication", "tools"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "metered",
    reason: "Pay-per-use plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "CATEGORY_NOT_ALLOWED") {
  throw new Error("Expected category-not-allowed refusal.");
}

console.log("SMOKE_MESH_POLICY_INVALID=PASS");