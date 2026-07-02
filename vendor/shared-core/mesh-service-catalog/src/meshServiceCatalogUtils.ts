import type { MeshServiceCode } from "./meshServiceCatalogTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeMeshServiceCatalogId(subjectId: string, serviceCode: MeshServiceCode): string {
  return `mesh_service_${subjectId}_${serviceCode}`;
}

export function isMeshServiceCode(value: string): value is MeshServiceCode {
  return [
    "MESSAGING",
    "VOICE",
    "SMALL_FILES",
    "SIMPLE_DASHBOARDS",
    "VIDEO_STREAMING",
    "AUDIO_STREAMING",
    "BULK_DOWNLOADS",
    "LIGHT_GAMING",
    "WEATHER",
    "MAPS",
    "CALENDAR",
    "LOGS"
  ].includes(value);
}