export interface TraversalMarker {
  markerId: string;
  projectId: string;
  locationType:
    | "decision_point"
    | "branch"
    | "state_change"
    | "instruction"
    | "handoff"
    | "correction";
  summary: string;
  priorMarkerId?: string;
  relatedObjectIds: string[];
  confidence: number;
  createdAt: string;
}
