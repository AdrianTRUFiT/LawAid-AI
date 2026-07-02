import type { RoutingRuntimeContext } from "./routingRuntimeContextContracts";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function classifyRoutingRuntimeContextShape(value: unknown):
  | "ROUTING_RUNTIME_CONTEXT_VALID"
  | "ROUTING_RUNTIME_CONTEXT_INVALID" {
  if (!value || typeof value !== "object") {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  const data = value as Record<string, unknown>;

  if (data.artifactType !== "ROUTING_RUNTIME_CONTEXT") {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isString(data.generatedAt)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (data.sourceRuntimeReportFile !== undefined && !isString(data.sourceRuntimeReportFile)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isString(data.runtimeClosureState)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isBoolean(data.deterministicReplayStable)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isStringArray(data.hilStateTags)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isFiniteNumber(data.degradedSupportCount)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isFiniteNumber(data.overlapPairCount)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  if (!isStringArray(data.reasons)) {
    return "ROUTING_RUNTIME_CONTEXT_INVALID";
  }

  return "ROUTING_RUNTIME_CONTEXT_VALID";
}

export function assertRoutingRuntimeContext(value: unknown): RoutingRuntimeContext {
  const classification = classifyRoutingRuntimeContextShape(value);

  if (classification !== "ROUTING_RUNTIME_CONTEXT_VALID") {
    throw new Error("routing_runtime_context_invalid");
  }

  return value as RoutingRuntimeContext;
}
