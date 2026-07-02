import type { GovernedFinancialOversightState } from "./types";

const oversightArtifacts: GovernedFinancialOversightState[] = [];

export function getFinTechionArtifacts(): GovernedFinancialOversightState[] {
  return [...oversightArtifacts];
}

export function resetFinTechionArtifacts(): void {
  oversightArtifacts.length = 0;
}

export function recordOversightArtifact(
  artifact: GovernedFinancialOversightState,
): GovernedFinancialOversightState {
  oversightArtifacts.push(artifact);
  return artifact;
}
