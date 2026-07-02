export interface MeshCapacityPlanningInput {
  subjectId: string;
  regionCount: number;
  stationsPerRegion?: number;
  relaysPerRegion?: number;
  devicesPerRegion?: number;
}

export interface MeshCapacityPlanningArtifact {
  capacityPlanId: string;
  subjectId: string;
  regionCount: number;
  stationsPerRegion: number;
  relaysPerRegion: number;
  devicesPerRegion: number;
  totalStations: number;
  totalRelays: number;
  totalDevices: number;
  densityClass: "tight" | "wide";
  reason: string;
  createdAt: string;
}

export interface MeshCapacityPlanningRefusal {
  refusalCode: "INVALID_REGION_COUNT";
  refusalReason: string;
}

export interface MeshCapacityPlanningResult {
  ok: boolean;
  artifact: MeshCapacityPlanningArtifact | null;
  refusal: MeshCapacityPlanningRefusal | null;
}