import { AssetInput, AssetDetectionResult, AssetCategory, AssetCondition, ReadinessState } from "./assetDetectionTypes";

function classify(input: AssetInput): AssetCategory {
  const name = input.originalName.toLowerCase();
  const text = (input.contentText || "").toLowerCase();

  if (name.includes("bank") || name.includes("statement") || text.includes("account summary")) return "BANK_STATEMENT";
  if (name.includes("invoice") || text.includes("invoice")) return "INVOICE";
  if (name.includes("motion") || text.includes("motion")) return "MOTION";
  if (name.includes("order") || text.includes("ordered and adjudged")) return "COURT_ORDER";
  if (name.endsWith(".eml") || text.includes("from:") || text.includes("subject:")) return "EMAIL";
  if (name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js")) return "CODE_FILE";
  if (name.endsWith(".json") || name.includes("report")) return "REPORT";
  if (name.endsWith(".pdf") || text.includes("case no")) return "LEGAL_DOCUMENT";

  return "UNKNOWN";
}

function detectCondition(input: AssetInput): AssetCondition {
  if (input.confirmedUnavailable) return "CONFIRMED_UNAVAILABLE";
  if (input.expectedButMissing) return "MISSING";
  if (!input.contentText && !input.sourcePath) return "UNKNOWN";
  if (input.contentText === "[UNREADABLE]") return "UNREADABLE";
  return "COMPLETE";
}

function determineReadiness(condition: AssetCondition, hasDependency: boolean): ReadinessState {
  if (condition === "COMPLETE" || condition === "DUPLICATE") return "SAFE";
  if (condition === "MISSING" && hasDependency) return "REFUSED";
  if (condition === "CONFIRMED_UNAVAILABLE") return "HOLD";
  return "HOLD";
}

export function detectAsset(input: AssetInput): AssetDetectionResult {
  const category = classify(input);
  const condition = detectCondition(input);
  const downstreamReferences = input.referencedBy || [];
  const hasDependency = downstreamReferences.length > 0;
  const readinessState = determineReadiness(condition, hasDependency);

  return {
    assetId: "asset_" + Buffer.from(input.originalName).toString("base64url").slice(0, 14),
    protocol: "ADP",
    originalName: input.originalName,
    category,
    condition,
    readinessState,
    downstreamReferences,
    missingByReference: condition === "MISSING" ? downstreamReferences : [],
    consequenceSummary:
      condition === "MISSING"
        ? "Missing asset may compromise downstream reasoning or proof."
        : condition === "CONFIRMED_UNAVAILABLE"
        ? "Asset confirmed unavailable. Future reasoning must not rely on it as available evidence."
        : "Asset is usable subject to normal verification.",
    confidenceScore: condition === "COMPLETE" ? 0.9 : 0.35,
    updatedAt: new Date().toISOString()
  };
}
