export type MeshServiceCode =
  | "MESSAGING"
  | "VOICE"
  | "SMALL_FILES"
  | "SIMPLE_DASHBOARDS"
  | "VIDEO_STREAMING"
  | "AUDIO_STREAMING"
  | "BULK_DOWNLOADS"
  | "LIGHT_GAMING"
  | "WEATHER"
  | "MAPS"
  | "CALENDAR"
  | "LOGS";

export type MeshServiceCategory =
  | "communication"
  | "entertainment"
  | "tools";

export type ServiceBandwidthClass =
  | "low"
  | "moderate"
  | "high";

export interface MeshServiceCatalogInput {
  subjectId: string;
  serviceCode: string;
}

export interface MeshServiceCatalogArtifact {
  serviceCatalogId: string;
  subjectId: string;
  serviceCode: MeshServiceCode;
  category: MeshServiceCategory;
  bandwidthClass: ServiceBandwidthClass;
  continuityCritical: boolean;
  transactionalEligible: boolean;
  reason: string;
  createdAt: string;
}

export interface MeshServiceCatalogRefusal {
  refusalCode: "UNSUPPORTED_SERVICE";
  refusalReason: string;
}

export interface MeshServiceCatalogResult {
  ok: boolean;
  artifact: MeshServiceCatalogArtifact | null;
  refusal: MeshServiceCatalogRefusal | null;
}