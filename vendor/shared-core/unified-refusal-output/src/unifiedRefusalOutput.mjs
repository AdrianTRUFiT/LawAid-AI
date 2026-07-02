import fs from "node:fs";
import path from "node:path";

const ROOT = "D:/DEV/AIVA/shared-core/unified-refusal-output";
const recordsDir = path.join(ROOT, "records");
fs.mkdirSync(recordsDir, { recursive: true });

export const REFUSAL_SOURCES = {
  MARK: "MARK_SECURITY",
  ARTIFACT_LAW: "ARTIFACT_LAW",
  PGL: "PRIVACY_GOVERNANCE_LAYER",
  DICE: "DICE",
  AIOP: "AIOP",
  FUNDTRACKERAI: "FUNDTRACKERAI"
};

export function writeUnifiedRefusal(input = {}) {
  const refusal = {
    accepted: false,
    refusalType: input.refusalType || "UNSPECIFIED_REFUSAL",
    refusalSource: input.refusalSource || "UNKNOWN_SOURCE",
    affectedArtifact: input.affectedArtifact || null,
    stage: input.stage || null,
    reason: input.reason || null,
    timestamp: new Date().toISOString(),
    authority: input.authority || null,
    nextAllowedAction: input.nextAllowedAction || "REVIEW_REQUIRED",
    blockedActions: input.blockedActions || [],
    detail: input.detail || {}
  };

  fs.writeFileSync(
    path.join(recordsDir, `UNIFIED-REFUSAL-${Date.now()}-${refusal.refusalType}.json`),
    JSON.stringify(refusal, null, 2)
  );

  return refusal;
}
