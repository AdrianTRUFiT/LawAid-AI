import { runMeshOperationsPolicy } from "../src/index.js";

const result = runMeshOperationsPolicy({
  subjectId: "pol_003",
  networkLoadPercent: 70,
  service: {
    serviceCatalogId: "svc_cat_003",
    subjectId: "svc_003",
    serviceCode: "WEATHER",
    category: "tools",
    bandwidthClass: "low",
    continuityCritical: true,
    transactionalEligible: true,
    reason: "Tooling-grade service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_003",
    subjectId: "svc_003",
    planCode: "PAY_PER_USE",
    allowedCategories: ["communication", "tools"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "metered",
    reason: "Pay-per-use plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.continuityPriorityRetained !== true) {
  throw new Error("Expected tools continuity priority.");
}

console.log("SMOKE_MESH_POLICY_TOOLS=PASS");