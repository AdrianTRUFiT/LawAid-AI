import type {
  MeshOperationsPolicyArtifact,
  MeshOperationsPolicyInput,
  MeshOperationsPolicyResult,
  MeshPriorityClass,
} from "./meshOperationsPolicyTypes.js";
import {
  makeOperationsPolicyId,
  nowIso,
} from "./meshOperationsPolicyUtils.js";

export function runMeshOperationsPolicy(
  input: MeshOperationsPolicyInput,
): MeshOperationsPolicyResult {
  if (!input.service || !input.plan) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Mesh operations policy refused because service or plan input is missing.",
      },
    };
  }

  if (!Number.isFinite(input.networkLoadPercent) || input.networkLoadPercent < 0 || input.networkLoadPercent > 100) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_NETWORK_LOAD",
        refusalReason: `Mesh operations policy refused because network load '${input.networkLoadPercent}' is invalid.`,
      },
    };
  }

  if (!input.plan.allowedCategories.includes(input.service.category)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "CATEGORY_NOT_ALLOWED",
        refusalReason: `Mesh operations policy refused because category '${input.service.category}' is not allowed by plan '${input.plan.planCode}'.`,
      },
    };
  }

  let priorityClass: MeshPriorityClass = "normal";
  let bandwidthCapKbps = 512;
  let throttlingApplied = false;
  let continuityPriorityRetained = false;
  let fairnessRule = "weighted_fair_use";
  let reason = "";

  if (input.service.category === "communication" || input.service.category === "tools") {
    priorityClass = input.service.continuityCritical ? "critical" : "high";
    bandwidthCapKbps = input.service.bandwidthClass === "moderate" ? 1500 : 768;
    continuityPriorityRetained = true;
    reason = "Continuity-aligned service kept at elevated priority.";
  } else if (input.service.category === "entertainment") {
    priorityClass = "normal";
    bandwidthCapKbps = input.service.bandwidthClass === "high" ? 2500 : 1200;
    reason = "Entertainment service starts at normal priority.";
  }

  if (input.networkLoadPercent >= 80) {
    if (input.service.category === "entertainment") {
      priorityClass = "throttled";
      bandwidthCapKbps = Math.min(bandwidthCapKbps, 768);
      throttlingApplied = true;
      fairnessRule = "continuity_first_under_load";
      reason = "Entertainment traffic throttled under high load to preserve continuity-critical services.";
    } else {
      bandwidthCapKbps = Math.max(512, Math.floor(bandwidthCapKbps * 0.85));
      fairnessRule = "protected_continuity_priority";
      reason = "Continuity-critical traffic retained priority under high load with bounded fairness reduction.";
    }
  }

  const artifact: MeshOperationsPolicyArtifact = {
    operationsPolicyId: makeOperationsPolicyId(
      input.subjectId,
      input.service.serviceCode,
      input.plan.planCode,
    ),
    subjectId: input.subjectId,
    serviceCode: input.service.serviceCode,
    planCode: input.plan.planCode,
    priorityClass,
    bandwidthCapKbps,
    throttlingApplied,
    continuityPriorityRetained,
    fairnessRule,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}