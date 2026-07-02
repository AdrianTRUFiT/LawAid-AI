import type {
  MeshServiceCatalogArtifact,
  MeshServiceCatalogInput,
  MeshServiceCatalogResult,
  MeshServiceCategory,
  ServiceBandwidthClass,
} from "./meshServiceCatalogTypes.js";
import {
  isMeshServiceCode,
  makeMeshServiceCatalogId,
  nowIso,
} from "./meshServiceCatalogUtils.js";

export function runMeshServiceCatalog(
  input: MeshServiceCatalogInput,
): MeshServiceCatalogResult {
  if (!isMeshServiceCode(input.serviceCode)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "UNSUPPORTED_SERVICE",
        refusalReason: `Mesh service catalog refused because service '${input.serviceCode}' is unsupported.`,
      },
    };
  }

  let category: MeshServiceCategory;
  let bandwidthClass: ServiceBandwidthClass;
  let continuityCritical = false;
  let transactionalEligible = false;
  let reason = "";

  switch (input.serviceCode) {
    case "MESSAGING":
    case "VOICE":
    case "SMALL_FILES":
    case "SIMPLE_DASHBOARDS":
      category = "communication";
      bandwidthClass =
        input.serviceCode === "VOICE" ? "moderate" : "low";
      continuityCritical = true;
      transactionalEligible = true;
      reason = "Communication-grade service for resilient mesh use.";
      break;

    case "VIDEO_STREAMING":
    case "AUDIO_STREAMING":
    case "BULK_DOWNLOADS":
    case "LIGHT_GAMING":
      category = "entertainment";
      bandwidthClass =
        input.serviceCode === "VIDEO_STREAMING" || input.serviceCode === "BULK_DOWNLOADS"
          ? "high"
          : "moderate";
      continuityCritical = false;
      transactionalEligible = true;
      reason = "Entertainment-grade service on top of mesh utility.";
      break;

    case "WEATHER":
    case "MAPS":
    case "CALENDAR":
    case "LOGS":
      category = "tools";
      bandwidthClass = "low";
      continuityCritical = true;
      transactionalEligible = true;
      reason = "Tooling-grade service aligned with resilient utility access.";
      break;
  }

  const artifact: MeshServiceCatalogArtifact = {
    serviceCatalogId: makeMeshServiceCatalogId(input.subjectId, input.serviceCode),
    subjectId: input.subjectId,
    serviceCode: input.serviceCode,
    category,
    bandwidthClass,
    continuityCritical,
    transactionalEligible,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}