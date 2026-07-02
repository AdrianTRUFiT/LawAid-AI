import type { WorkflowLightDefinition, WorkflowScenarioType } from "./workflowTypes.js";

export const UNIVERSAL_LIGHT_LIBRARY: WorkflowLightDefinition[] = [
  {
    lightId: "intake",
    label: "Intake",
    category: "input",
    dependencyIds: [],
    defaultRequired: true,
    defaultOrder: 1,
  },
  {
    lightId: "normalization",
    label: "Normalization",
    category: "normalization",
    dependencyIds: ["intake"],
    defaultRequired: true,
    defaultOrder: 2,
  },
  {
    lightId: "translation",
    label: "Translation",
    category: "translation",
    dependencyIds: ["normalization"],
    defaultRequired: false,
    defaultOrder: 3,
  },
  {
    lightId: "valuation",
    label: "Valuation",
    category: "valuation",
    dependencyIds: ["normalization"],
    defaultRequired: false,
    defaultOrder: 4,
  },
  {
    lightId: "routing",
    label: "Routing",
    category: "routing",
    dependencyIds: ["normalization"],
    defaultRequired: true,
    defaultOrder: 5,
  },
  {
    lightId: "reservation",
    label: "Reservation",
    category: "reservation",
    dependencyIds: ["routing"],
    defaultRequired: false,
    defaultOrder: 6,
  },
  {
    lightId: "settlement",
    label: "Settlement",
    category: "settlement",
    dependencyIds: ["reservation"],
    defaultRequired: false,
    defaultOrder: 7,
  },
  {
    lightId: "receiving",
    label: "Receiving",
    category: "receiving",
    dependencyIds: ["settlement"],
    defaultRequired: false,
    defaultOrder: 8,
  },
  {
    lightId: "oversight",
    label: "Oversight",
    category: "oversight",
    dependencyIds: ["routing"],
    defaultRequired: false,
    defaultOrder: 9,
  },
  {
    lightId: "presentation",
    label: "Presentation",
    category: "presentation",
    dependencyIds: ["routing"],
    defaultRequired: true,
    defaultOrder: 10,
  },
];

export function getScenarioDefaultLights(
  scenarioType: WorkflowScenarioType,
): string[] {
  switch (scenarioType) {
    case "travel_booking":
      return ["intake", "normalization", "translation", "routing", "reservation", "presentation"];
    case "delivery_routing":
      return ["intake", "normalization", "routing", "presentation"];
    case "transport_quote":
      return ["intake", "normalization", "valuation", "routing", "presentation"];
    case "reservation_lock":
      return ["intake", "normalization", "routing", "reservation", "settlement", "presentation"];
    case "cross_border_flow":
      return ["intake", "normalization", "translation", "valuation", "routing", "reservation", "settlement", "receiving", "oversight", "presentation"];
    default:
      return ["intake", "normalization", "routing", "presentation"];
  }
}