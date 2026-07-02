import { runMeshOperationsPolicy } from "../src/index.js";

const result = runMeshOperationsPolicy({
  subjectId: "pol_002",
  networkLoadPercent: 85,
  service: {
    serviceCatalogId: "svc_cat_002",
    subjectId: "svc_002",
    serviceCode: "VIDEO_STREAMING",
    category: "entertainment",
    bandwidthClass: "high",
    continuityCritical: false,
    transactionalEligible: true,
    reason: "Entertainment-grade service.",
    createdAt: new Date().toISOString(),
  },
  plan: {
    planMatrixId: "plan_002",
    subjectId: "svc_002",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.priorityClass !== "throttled" || result.artifact.throttlingApplied !== true) {
  throw new Error("Expected entertainment throttling.");
}

console.log("SMOKE_MESH_POLICY_ENTERTAINMENT=PASS");