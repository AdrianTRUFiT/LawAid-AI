export type RateStage =
  | "RECRUIT"
  | "ACQUIRE"
  | "TRANSACT"
  | "ENGAGE";

export type CanonicalArtifactType =
  | "RAW_SIGNAL"
  | "CAPTURED_SIGNAL"
  | "VERIFIED_OPPORTUNITY"
  | "ACTIVATED_TRANSACTION_STATE"
  | "LIVE_SYSTEM_RECORD";

export type DeviceClass =
  | "WINDOWS_PC"
  | "MAC"
  | "IOS_PHONE"
  | "IPAD"
  | "ANDROID_PHONE"
  | "ANDROID_TABLET"
  | "MOBILE_BROWSER"
  | "PWA"
  | "FUTURE_DEVICE";

export type DependencyStatus =
  | "SATISFIED"
  | "MISSING"
  | "STALE"
  | "MUTATED";

export type TourExecutionOutcome =
  | "EXECUTION_ALLOWED"
  | "EXECUTION_HELD"
  | "EXECUTION_BLOCKED";

export type TourRefusalCode =
  | "TOUR_PAYLOAD_MUTATED"
  | "TOUR_PAYLOAD_HASH_MISSING"
  | "TOUR_TRUTH_SEAL_MISSING"
  | "TOUR_ARTIFACT_STALE"
  | "TOUR_DEPENDENCY_MISSING"
  | "TOUR_DEPENDENCY_STALE"
  | "TOUR_DEPENDENCY_MUTATED"
  | "TOUR_ROUTE_NOT_GOVERNED"
  | "TOUR_DEVICE_NOT_SUPPORTED"
  | "TOUR_RUNTIME_NOT_PORTABLE"
  | "TOUR_CONSEQUENCE_WITHOUT_REVALIDATION";

export interface RuntimePortabilityProfile {
  deviceClass: DeviceClass;
  osBound: boolean;
  absolutePathRequired: boolean;
  shellRequired: "NONE" | "POWERSHELL" | "BASH" | "ZSH" | "NATIVE_APP" | "BROWSER";
  supportsRelativePaths: boolean;
  supportsOfflineQueue: boolean;
}

export interface TourDependency {
  dependencyId: string;
  required: boolean;
  status: DependencyStatus;
  artifactType?: CanonicalArtifactType;
}

export interface TourRoutableArtifact<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  artifactId: string;
  artifactType: CanonicalArtifactType;
  stage: RateStage;
  createdAt: string;
  expiresAt: string;
  payload: TPayload;
  payloadHash: string;
  truthSeal: string;
  dependencies: TourDependency[];
}

export interface TourExecutionRequest<TPayload extends Record<string, unknown> = Record<string, unknown>> {
  routeId: string;
  requestedAt: string;
  requestedBy: string;
  consequenceClass: "NONE" | "LOW" | "MEDIUM" | "HIGH";
  runtime: RuntimePortabilityProfile;
  artifact: TourRoutableArtifact<TPayload>;
  candidatePayload: TPayload;
}

export interface TourDecision {
  routeId: string;
  artifactId: string;
  outcome: TourExecutionOutcome;
  allowed: boolean;
  refusalCodes: TourRefusalCode[];
  checked: {
    freshness: boolean;
    dependencies: boolean;
    payloadIntegrity: boolean;
    truthSeal: boolean;
    governedRoute: boolean;
    portableRuntime: boolean;
    supportedDevice: boolean;
  };
  message: string;
  decidedAt: string;
}
