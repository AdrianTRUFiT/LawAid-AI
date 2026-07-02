import type {
  StrategicIntakeItem,
  StrategicCategory,
  StrategicDecision,
} from "../../types/strategicIntake";

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return `si-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function detectCategory(text: string): StrategicCategory {
  const lower = text.toLowerCase();

  if (lower.includes("page") || lower.includes("view") || lower.includes("screen")) {
    return "page";
  }
  if (lower.includes("workflow") || lower.includes("state") || lower.includes("outbox")) {
    return "workflow";
  }
  if (lower.includes("llm") || lower.includes("ai") || lower.includes("chat") || lower.includes("provider")) {
    return "intelligence";
  }
  if (lower.includes("patch") || lower.includes("button") || lower.includes("dead link") || lower.includes("fix")) {
    return "patch";
  }
  if (lower.includes("memory") || lower.includes("recall") || lower.includes("save context")) {
    return "memory";
  }

  return "future";
}

function scoreText(text: string) {
  const lower = text.toLowerCase();

  const burdenRemoved = clampScore(
    lower.includes("faster") || lower.includes("save time") || lower.includes("reduce") ? 8 : 5,
  );

  const timingProtected = clampScore(
    lower.includes("deadline") || lower.includes("follow up") || lower.includes("timing") ? 8 : 4,
  );

  const confusionClarified = clampScore(
    lower.includes("clear") || lower.includes("workflow") || lower.includes("organize") ? 8 : 5,
  );

  const transitionCleaned = clampScore(
    lower.includes("state") || lower.includes("move") || lower.includes("handoff") ? 8 : 4,
  );

  const workflowImproved = clampScore(
    lower.includes("process") || lower.includes("flow") || lower.includes("patch") ? 8 : 5,
  );

  const total =
    burdenRemoved +
    timingProtected +
    confusionClarified +
    transitionCleaned +
    workflowImproved;

  return {
    burdenRemoved,
    timingProtected,
    confusionClarified,
    transitionCleaned,
    workflowImproved,
    total,
  };
}

function chooseDecision(total: number): StrategicDecision {
  if (total >= 40) return "build-now";
  if (total >= 33) return "patch-queue";
  if (total >= 25) return "need-later";
  return "archive-reference";
}

function buildReason(category: StrategicCategory, decision: StrategicDecision): string[] {
  const base = [`Category: ${category}`];

  if (decision === "build-now") {
    return [...base, "High immediate workflow value.", "Strong fit for current build pressure."];
  }
  if (decision === "patch-queue") {
    return [...base, "Useful, but not the single next move.", "Queue for bounded execution."];
  }
  if (decision === "need-later") {
    return [...base, "Signal preserved for later.", "Not yet urgent enough for current build state."];
  }
  return [...base, "Reference value only right now.", "Do not spend current build energy here."];
}

function nextAction(decision: StrategicDecision): string {
  if (decision === "build-now") return "Build this now.";
  if (decision === "patch-queue") return "Queue this for the next bounded patch pass.";
  if (decision === "need-later") return "Keep this visible, but do not build it yet.";
  return "Archive for reference only.";
}

export function evaluateStrategicInput(text: string): StrategicIntakeItem {
  const category = detectCategory(text);
  const score = scoreText(text);
  const decision = chooseDecision(score.total);

  return {
    id: makeId(),
    createdAt: nowIso(),
    text,
    category,
    decision,
    reason: buildReason(category, decision),
    recommendedNextAction: nextAction(decision),
    score,
  };
}
