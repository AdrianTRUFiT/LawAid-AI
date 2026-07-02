export type StrategicCategory =
  | "page"
  | "workflow"
  | "intelligence"
  | "patch"
  | "memory"
  | "future";

export type StrategicDecision =
  | "build-now"
  | "patch-queue"
  | "need-later"
  | "archive-reference";

export interface StrategicIntakeItem {
  id: string;
  createdAt: string;
  text: string;
  category: StrategicCategory;
  decision: StrategicDecision;
  reason: string[];
  recommendedNextAction: string;
  score: {
    burdenRemoved: number;
    timingProtected: number;
    confusionClarified: number;
    transitionCleaned: number;
    workflowImproved: number;
    total: number;
  };
}