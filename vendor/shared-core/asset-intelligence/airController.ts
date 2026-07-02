import { AssetDetectionResult } from "../asset-detection";
import { AIRScope, AssetIntelligenceReport } from "./airTypes";

export function generateAIR(scope: AIRScope, title: string, assets: AssetDetectionResult[]): AssetIntelligenceReport {
  const readinessState =
    assets.some(a => a.readinessState === "REFUSED") ? "REFUSED" :
    assets.some(a => a.readinessState === "HOLD") ? "HOLD" :
    "SAFE";

  return {
    reportId: "air_" + Date.now(),
    protocol: "AIR",
    scope,
    title,
    readinessState,
    assetsReviewed: assets.length,
    missingAssets: assets.filter(a => a.condition === "MISSING").map(a => a.originalName),
    confirmedUnavailableAssets: assets.filter(a => a.condition === "CONFIRMED_UNAVAILABLE").map(a => a.originalName),
    dependencyGraphText: assets.map(a => `${a.assetId} -> ${a.downstreamReferences.join(", ") || "none"}`).join("\n"),
    consequenceSummary: assets.map(a => `- ${a.originalName}: ${a.consequenceSummary}`).join("\n"),
    recommendedNextStep:
      readinessState === "SAFE" ? "Proceed to next governed step." :
      readinessState === "HOLD" ? "Proceed only if held item is not consequence-bearing or is formally confirmed unavailable." :
      "Do not proceed until refused dependency is resolved or formally removed from the consequence path.",
    generatedAt: new Date().toISOString(),
    assets
  };
}

export function renderAIRMarkdown(report: AssetIntelligenceReport): string {
  return `# Asset Intelligence Report — ${report.title}

Protocol: ${report.protocol}
State: ${report.readinessState}
Scope: ${report.scope}
Assets Reviewed: ${report.assetsReviewed}

## Missing Assets
${report.missingAssets.length ? report.missingAssets.map(x => `- ${x}`).join("\n") : "- None"}

## Confirmed Unavailable
${report.confirmedUnavailableAssets.length ? report.confirmedUnavailableAssets.map(x => `- ${x}`).join("\n") : "- None"}

## Dependency Graph
\`\`\`
${report.dependencyGraphText}
\`\`\`

## Consequence Summary
${report.consequenceSummary}

## Recommended Next Step
${report.recommendedNextStep}
`;
}
