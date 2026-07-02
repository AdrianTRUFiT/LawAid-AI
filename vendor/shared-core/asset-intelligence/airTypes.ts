import { AssetDetectionResult, ReadinessState } from "../asset-detection";

export type AIRScope = "ASSET" | "SPRINT" | "LANE" | "MATTER" | "LAUNCH_CONTROL";

export interface AssetIntelligenceReport {
  reportId: string;
  protocol: "AIR";
  scope: AIRScope;
  title: string;
  readinessState: ReadinessState;
  assetsReviewed: number;
  missingAssets: string[];
  confirmedUnavailableAssets: string[];
  dependencyGraphText: string;
  consequenceSummary: string;
  recommendedNextStep: string;
  generatedAt: string;
  assets: AssetDetectionResult[];
}
