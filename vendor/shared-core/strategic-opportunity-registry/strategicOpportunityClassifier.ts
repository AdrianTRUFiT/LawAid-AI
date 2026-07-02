import {
  StrategicOpportunityAuthorityBoundary,
  StrategicOpportunityClassificationInput,
  StrategicOpportunityPriority,
  StrategicOpportunityRecord,
  StrategicOpportunityStatus
} from "./strategicOpportunityContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultAuthorityBoundary(): StrategicOpportunityAuthorityBoundary {
  return {
    registryEntryIsNotDoctrine: true,
    registryEntryIsNotBuildAuthorization: true,
    registryEntryIsNotProductCommitment: true,
    preservedStrategicSignalOnlyUnlessPromoted: true,
    promotionRequiresAuthorizedDecision: true
  };
}

export function normalizePriority(priority?: StrategicOpportunityPriority): StrategicOpportunityPriority {
  return priority || "MEDIUM";
}

export function classifyOpportunityStatus(
  input: StrategicOpportunityClassificationInput
): StrategicOpportunityStatus {
  if (input.requestedStatus) return input.requestedStatus;

  const text = `${input.title} ${input.summary}`.toLowerCase();

  if (text.includes("superseded") || text.includes("replace old") || text.includes("deprecated")) {
    return "SUPERSEDED";
  }

  if (text.includes("hold") || text.includes("not now") || text.includes("later")) {
    return "HOLD";
  }

  if (text.includes("market") || text.includes("go-to-market") || text.includes("pricing option")) {
    return "MARKET_OPTION";
  }

  if (text.includes("strategy") || text.includes("doctrine context") || text.includes("positioning")) {
    return "STRATEGY_CONTEXT";
  }

  if (text.includes("code now") || text.includes("immediate build") || text.includes("next code")) {
    return "CODE_NOW";
  }

  return "BUILD_QUEUE";
}

export function createStrategicOpportunityRecord(
  input: StrategicOpportunityClassificationInput
): StrategicOpportunityRecord {
  const now = new Date().toISOString();

  return {
    opportunityId: id("strategic-opportunity"),
    title: input.title.trim(),
    summary: input.summary.trim(),
    source: input.source,
    relatedModules: input.relatedModules || [],
    status: classifyOpportunityStatus(input),
    priority: normalizePriority(input.priority),
    dependencies: input.dependencies || [],
    futureTrigger: input.futureTrigger,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultAuthorityBoundary()
  };
}
