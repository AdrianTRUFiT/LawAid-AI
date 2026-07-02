import type {
  MeshCapacityPlanningArtifact,
  MeshCapacityPlanningInput,
  MeshCapacityPlanningResult,
} from "./meshCapacityPlanningTypes.js";
import {
  makeCapacityPlanId,
  nowIso,
} from "./meshCapacityPlanningUtils.js";

export function runMeshCapacityPlanning(
  input: MeshCapacityPlanningInput,
): MeshCapacityPlanningResult {
  if (!Number.isFinite(input.regionCount) || input.regionCount <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_REGION_COUNT",
        refusalReason: `Mesh capacity planning refused because regionCount '${input.regionCount}' is invalid.`,
      },
    };
  }

  const stationsPerRegion = input.stationsPerRegion ?? 3;
  const relaysPerRegion = input.relaysPerRegion ?? 10;
  const devicesPerRegion = input.devicesPerRegion ?? 100;

  const totalStations = input.regionCount * stationsPerRegion;
  const totalRelays = input.regionCount * relaysPerRegion;
  const totalDevices = input.regionCount * devicesPerRegion;

  const densityClass = relaysPerRegion >= 10 ? "tight" : "wide";

  const artifact: MeshCapacityPlanningArtifact = {
    capacityPlanId: makeCapacityPlanId(input.subjectId, input.regionCount),
    subjectId: input.subjectId,
    regionCount: input.regionCount,
    stationsPerRegion,
    relaysPerRegion,
    devicesPerRegion,
    totalStations,
    totalRelays,
    totalDevices,
    densityClass,
    reason: "Mesh capacity planning calculated from regional anchor/relay/device assumptions.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}