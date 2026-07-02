import type {
  AimChokepointControlSignalType,
  AimEvidenceLabel,
  AimInfrastructureLayer,
  AimStrategicDenialEffect
} from "./aimContracts.js";

export const AIM_INFRASTRUCTURE_LAYERS: AimInfrastructureLayer[] = [
  "Compute",
  "Memory / HBM",
  "Networking / Optical",
  "Power / Grid",
  "Cooling / Thermal",
  "Fabrication / Equipment",
  "Sovereign / Defense",
  "Quantum / Frontier Compute",
  "Data / Licensing",
  "Land / Permitting",
  "Advanced Packaging"
];

export const AIM_EVIDENCE_LABELS: AimEvidenceLabel[] = [
  "Confirmed public filing",
  "Company announcement",
  "Reputable reporting",
  "Industry inference",
  "Speculation",
  "Rumor / Ignore"
];

export const AIM_CHOKEPOINT_CONTROL_SIGNAL_TYPES: AimChokepointControlSignalType[] = [
  "supplier acquisition",
  "long-term supply agreement",
  "exclusive partnership",
  "power purchase agreement",
  "compute reservation",
  "HBM allocation",
  "foundry reservation",
  "advanced packaging allocation",
  "data licensing deal",
  "sovereign cloud contract",
  "fiber route control",
  "energy infrastructure control",
  "rare earth / metals offtake",
  "strategic investment",
  "talent acquisition"
];

export const AIM_STRATEGIC_DENIAL_EFFECTS: AimStrategicDenialEffect[] = [
  "None",
  "Low",
  "Moderate",
  "High",
  "Critical"
];

export const AIM_FORBIDDEN_LANGUAGE = [
  "Guaranteed profit",
  "Buy now",
  "Sell now",
  "Easy money",
  "Sure winner",
  "Automatic trade",
  "Prediction certainty",
  "Trade approved",
  "Investment advice",
  "Execute order"
] as const;