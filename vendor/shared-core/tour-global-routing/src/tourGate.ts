import {
  TourDecision,
  TourExecutionRequest,
  TourRefusalCode,
} from "./tourContracts";
import { isSupportedDevice, isPortableRuntime } from "./runtimePortability";
import { isExpired, nowIso, portableDigest } from "./tourUtils";

export function enforceTourExecutionRevalidation(
  request: TourExecutionRequest
): TourDecision {
  const refusalCodes: TourRefusalCode[] = [];

  const expectedPayloadHash = request.artifact.payloadHash;
  const candidatePayloadHash = portableDigest(request.candidatePayload);

  const payloadIntegrity = Boolean(expectedPayloadHash) && expectedPayloadHash === candidatePayloadHash;
  const truthSeal = Boolean(request.artifact.truthSeal && request.artifact.truthSeal.trim().length > 0);
  const freshness = !isExpired(request.artifact.expiresAt, request.requestedAt);
  const governedRoute = Boolean(request.routeId && request.artifact.artifactId && request.artifact.artifactType);
  const portableRuntime = isPortableRuntime(request.runtime);
  const supportedDevice = isSupportedDevice(request.runtime);

  const dependencyFailures = request.artifact.dependencies.filter((dependency) => {
    return dependency.required && dependency.status !== "SATISFIED";
  });

  const dependencies = dependencyFailures.length === 0;

  if (!expectedPayloadHash) refusalCodes.push("TOUR_PAYLOAD_HASH_MISSING");
  if (!payloadIntegrity) refusalCodes.push("TOUR_PAYLOAD_MUTATED");
  if (!truthSeal) refusalCodes.push("TOUR_TRUTH_SEAL_MISSING");
  if (!freshness) refusalCodes.push("TOUR_ARTIFACT_STALE");
  if (!governedRoute) refusalCodes.push("TOUR_ROUTE_NOT_GOVERNED");
  if (!supportedDevice) refusalCodes.push("TOUR_DEVICE_NOT_SUPPORTED");
  if (!portableRuntime) refusalCodes.push("TOUR_RUNTIME_NOT_PORTABLE");

  for (const failure of dependencyFailures) {
    if (failure.status === "MISSING") refusalCodes.push("TOUR_DEPENDENCY_MISSING");
    if (failure.status === "STALE") refusalCodes.push("TOUR_DEPENDENCY_STALE");
    if (failure.status === "MUTATED") refusalCodes.push("TOUR_DEPENDENCY_MUTATED");
  }

  let outcome: TourDecision["outcome"] = "EXECUTION_ALLOWED";

  if (!payloadIntegrity || !truthSeal || !governedRoute || !supportedDevice || !portableRuntime) {
    outcome = "EXECUTION_BLOCKED";
  } else if (!freshness || !dependencies) {
    outcome = "EXECUTION_HELD";
  }

  if (request.consequenceClass !== "NONE" && outcome !== "EXECUTION_ALLOWED") {
    if (!refusalCodes.includes("TOUR_CONSEQUENCE_WITHOUT_REVALIDATION")) {
      refusalCodes.push("TOUR_CONSEQUENCE_WITHOUT_REVALIDATION");
    }
  }

  return {
    routeId: request.routeId,
    artifactId: request.artifact.artifactId,
    outcome,
    allowed: outcome === "EXECUTION_ALLOWED",
    refusalCodes,
    checked: {
      freshness,
      dependencies,
      payloadIntegrity,
      truthSeal,
      governedRoute,
      portableRuntime,
      supportedDevice,
    },
    message:
      outcome === "EXECUTION_ALLOWED"
        ? "TOUR revalidation passed across universal runtime target. Execution may proceed."
        : outcome === "EXECUTION_HELD"
          ? "TOUR revalidation held execution pending freshness or dependency repair."
          : "TOUR revalidation blocked execution before consequence.",
    decidedAt: nowIso(),
  };
}
