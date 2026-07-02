export type TruthLane = "public" | "semi_private" | "private";

export interface TruthClassification {
  truthLane: TruthLane;
  rationale: string[];
}

export function classifyTruthLane(tags: string[], text: string): TruthClassification {
  const joined = `${tags.join(" ")} ${text}`.toLowerCase();

  if (
    joined.includes("social") ||
    joined.includes("marketing") ||
    joined.includes("public") ||
    joined.includes("shareable")
  ) {
    return { truthLane: "public", rationale: ["matched_public_signal"] };
  }

  if (
    joined.includes("legal") ||
    joined.includes("private") ||
    joined.includes("confidential") ||
    joined.includes("custody") ||
    joined.includes("sensitive") ||
    joined.includes("financial")
  ) {
    return { truthLane: "private", rationale: ["matched_private_signal"] };
  }

  return { truthLane: "semi_private", rationale: ["default_semi_private"] };
}
