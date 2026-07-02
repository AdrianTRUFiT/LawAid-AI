import type { MeshRoute } from "./meshContracts.js";

export const DEFAULT_MESH_ROUTES: MeshRoute[] = [
  {
    sourceDomain: "ai-coding-lab",
    targetDomain: "shared-kernel",
    artifactTypes: ["FailureRecord", "AnalysisRecord", "CorrectionRecord", "TestedRecord"]
  },
  {
    sourceDomain: "dice",
    targetDomain: "shared-kernel",
    artifactTypes: ["PainRecord", "PatternRecord", "ClarityRecord", "CodeIntent"]
  },
  {
    sourceDomain: "aiop",
    targetDomain: "shared-kernel",
    artifactTypes: ["PainRecord", "PatternRecord", "ClarityRecord", "CodeIntent"]
  },
  {
    sourceDomain: "fundtracker",
    targetDomain: "shared-kernel",
    artifactTypes: ["FailureRecord", "AnalysisRecord", "CorrectionRecord", "TestedRecord"]
  },
  {
    sourceDomain: "lawaidai",
    targetDomain: "shared-kernel",
    artifactTypes: [
      "PainRecord",
      "PatternRecord",
      "ClarityRecord",
      "CodeIntent",
      "FailureRecord",
      "AnalysisRecord",
      "CorrectionRecord",
      "TestedRecord"
    ]
  }
];
