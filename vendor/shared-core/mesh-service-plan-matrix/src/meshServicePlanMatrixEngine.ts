import type {
  MeshServicePlanMatrixArtifact,
  MeshServicePlanMatrixInput,
  MeshServicePlanMatrixResult,
} from "./meshServicePlanMatrixTypes.js";
import {
  isMeshPlanCode,
  makePlanMatrixId,
  nowIso,
} from "./meshServicePlanMatrixUtils.js";

export function runMeshServicePlanMatrix(
  input: MeshServicePlanMatrixInput,
): MeshServicePlanMatrixResult {
  if (!isMeshPlanCode(input.planCode)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_PLAN",
        refusalReason: `Mesh service plan matrix refused because plan '${input.planCode}' is invalid.`,
      },
    };
  }

  let allowedCategories: ("communication" | "entertainment" | "tools")[] = [];
  let supportsTransactions = false;
  let supportsContinuityPriority = false;
  let pricingMode: "subscription" | "metered" | "shared";
  let reason = "";

  switch (input.planCode) {
    case "MONTHLY":
      allowedCategories = ["communication", "tools", "entertainment"];
      supportsTransactions = true;
      supportsContinuityPriority = true;
      pricingMode = "subscription";
      reason = "Monthly plan supports broad mesh utility access.";
      break;

    case "PAY_PER_USE":
      allowedCategories = ["communication", "tools"];
      supportsTransactions = true;
      supportsContinuityPriority = true;
      pricingMode = "metered";
      reason = "Pay-per-use plan prioritizes lightweight and transactional mesh access.";
      break;

    case "GROUP_PLAN":
      allowedCategories = ["communication", "tools", "entertainment"];
      supportsTransactions = true;
      supportsContinuityPriority = true;
      pricingMode = "shared";
      reason = "Group plan supports shared mesh access across a bounded participant set.";
      break;
  }

  const artifact: MeshServicePlanMatrixArtifact = {
    planMatrixId: makePlanMatrixId(input.subjectId, input.planCode),
    subjectId: input.subjectId,
    planCode: input.planCode,
    allowedCategories,
    supportsTransactions,
    supportsContinuityPriority,
    pricingMode,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}