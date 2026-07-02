import { runMeshOperationsPolicy } from "../src/index.js";

const result = runMeshOperationsPolicy({
  subjectId: "pol_001",
  networkLoadPercent: 45,
  service: {
    serviceCatalogId: "svc_cat_001",
    subjectId: "svc_001",
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
    subjectId: "svc_001",
    planCode: "MONTHLY",
    allowedCategories: ["communication", "tools", "entertainment"],
    supportsTransactions: true,
    supportsContinuityPriority: true,
    pricingMode: "subscription",
    reason: "Monthly plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.priorityClass !== "critical") {
  throw new Error("Expected communication priority.");
}

console.log("SMOKE_MESH_POLICY_COMMUNICATION=PASS");