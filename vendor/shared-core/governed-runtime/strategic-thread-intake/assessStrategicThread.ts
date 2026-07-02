export type ThreadIntakeDisposition = "merge" | "sidecar" | "interrupt" | "park";

export interface StrategicThreadAssessment {
  disposition: ThreadIntakeDisposition;
  rationale: string[];
}

export function assessStrategicThread(text: string): StrategicThreadAssessment {
  const lowered = text.toLowerCase();

  if (lowered.includes("urgent") || lowered.includes("blocking") || lowered.includes("contradiction")) {
    return { disposition: "interrupt", rationale: ["high_priority_or_contradiction"] };
  }

  if (lowered.includes("same runtime") || lowered.includes("same project") || lowered.includes("active build")) {
    return { disposition: "merge", rationale: ["same_project_alignment"] };
  }

  if (lowered.includes("adjacent") || lowered.includes("framework") || lowered.includes("conceptual")) {
    return { disposition: "sidecar", rationale: ["adjacent_but_relevant"] };
  }

  return { disposition: "park", rationale: ["insufficient_alignment"] };
}
