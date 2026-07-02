export type TruthLane = "public" | "semi_private" | "private";

export interface TruthAdmissionDecision {
  requestedLane: TruthLane;
  resolvedLane: TruthLane;
  allowed: boolean;
  rationale: string[];
}

export function enforceTruthLane(requestedLane: TruthLane, text: string): TruthAdmissionDecision {
  const lowered = text.toLowerCase();

  const privateSignals = [
    "legal",
    "confidential",
    "sensitive",
    "custody",
    "financial",
    "private",
    "sealed",
    "privileged"
  ];

  const publicSignals = [
    "public",
    "marketing",
    "shareable",
    "social",
    "announcement"
  ];

  const matchedPrivate = privateSignals.filter((s) => lowered.includes(s));
  const matchedPublic = publicSignals.filter((s) => lowered.includes(s));

  if (matchedPrivate.length > 0) {
    return {
      requestedLane,
      resolvedLane: "private",
      allowed: requestedLane === "private",
      rationale: ["matched_private_signals", ...matchedPrivate]
    };
  }

  if (matchedPublic.length > 0) {
    return {
      requestedLane,
      resolvedLane: "public",
      allowed: requestedLane === "public" || requestedLane === "semi_private",
      rationale: ["matched_public_signals", ...matchedPublic]
    };
  }

  return {
    requestedLane,
    resolvedLane: requestedLane,
    allowed: true,
    rationale: ["no_hard_conflict_detected"]
  };
}
