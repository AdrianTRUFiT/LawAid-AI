import { runMeshOperationsPolicy } from "../src/index.js";

const result = runMeshOperationsPolicy({
  subjectId: "pol_004",
  networkLoadPercent: 50,
  service: {
    serviceCatalogId: "svc_cat_004",
    subjectId: "svc_004",
    serviceCode: "BULK_DOWNLOADS",
    category: "entertainment",
    bandwidthClass: "high",
    continuityCritical: false,
    transactionalEligible: true,
    reason: "Bulk download service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_004",
    subjectId: "svc_004",
    planCode: "GROUP_PLAN",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "shared",
    reason: "Group plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.bandwidthCapKbps !== 2500) {
  throw new Error("Expected high-bandwidth limit.");
}

console.log("SMOKE_MESH_POLICY_HIGH_BANDWIDTH=PASS");