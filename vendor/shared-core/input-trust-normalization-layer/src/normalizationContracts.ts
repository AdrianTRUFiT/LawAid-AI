import type { SemanticType } from "./inputTrustTypes.js";

export const REQUIRED_SEAL_KEYS: SemanticType[] = [
  "origin",
  "destination",
  "language",
  "currency",
  "unit_system",
];

export const LOCALIZATION_KEYS: SemanticType[] = [
  "country",
  "language",
  "currency",
  "unit_system",
];