export type LightCategory =
  | "input"
  | "normalization"
  | "translation"
  | "valuation"
  | "routing"
  | "reservation"
  | "settlement"
  | "receiving"
  | "oversight"
  | "presentation"
  | "generic";

export type LightStatus =
  | "inactive"
  | "required"
  | "ready"
  | "blocked"
  | "active";

export type WorkflowScenarioType =
  | "travel_booking"
  | "delivery_routing"
  | "transport_quote"
  | "reservation_lock"
  | "cross_border_flow"
  | "generic";

export interface WorkflowLightDefinition {
  lightId: string;
  label: string;
  category: LightCategory;
  dependencyIds: string[];
  defaultRequired: boolean;
  defaultOrder: number;
}

export interface LocalizationDefaults {
  countryCode: string;
  languageCode: string;
  currencyCode: string;
  unitSystem: "imperial" | "metric";
  locale: string;
}

export interface WorkflowScenarioInput {
  scenarioId: string;
  scenarioType: WorkflowScenarioType;
  requestedLightIds?: string[];
  variableSelectionIds?: string[];
  localization?: Partial<LocalizationDefaults>;
}

export interface WorkflowLightState {
  lightId: string;
  label: string;
  category: LightCategory;
  dependencyIds: string[];
  required: boolean;
  status: LightStatus;
  order: number;
  reason: string;
}

export interface WorkflowString {
  workflowStringId: string;
  scenarioId: string;
  scenarioType: WorkflowScenarioType;
  localization: LocalizationDefaults;
  lights: WorkflowLightState[];
  requiredLightCount: number;
  activeLightCount: number;
  blockedLightCount: number;
  fullyIlluminated: boolean;
  generatedAt: string;
}

export interface WorkflowCompositionResult {
  workflow: WorkflowString;
}