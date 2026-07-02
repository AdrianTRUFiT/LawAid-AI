import type { ScreeningDecision, ScreeningMode } from "./screeningTypes";

export function applyModeAdjustment(
  mode: ScreeningMode,
  decision: ScreeningDecision
): ScreeningDecision {
  if (mode === "disabled") return "PASS";
  if (mode === "observe") return "PASS";

  if (mode === "review") {
    if (decision === "REFUSE" || decision === "HOLD") return "REVIEW_REQUIRED";
    return decision;
  }

  return decision;
}

export function isScreeningEnabled(mode: ScreeningMode): boolean {
  return mode !== "disabled";
}
