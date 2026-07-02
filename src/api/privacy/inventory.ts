import { buildPrivacyInventory } from "../../lib/privacy/inventory";
import { classifyArtifact } from "../../lib/privacy/contracts";
import { sanitizeByArtifactType } from "../../lib/privacy/sanitizer";

export function getPrivacyInventoryApi() {
  return {
    ok: true,
    artifactType: "PrivacyInventory",
    payload: buildPrivacyInventory(),
  };
}

export function classifyArtifactApi(
  artifactType: string,
  payload: Record<string, unknown>,
) {
  return {
    ok: true,
    artifactType: "PrivacyClassification",
    payload: classifyArtifact(artifactType, payload),
  };
}

export function sanitizeArtifactPreviewApi(
  artifactType: string,
  payload: Record<string, unknown>,
) {
  return {
    ok: true,
    artifactType: "SanitizedArtifactPreview",
    payload: sanitizeByArtifactType(artifactType, payload),
  };
}
