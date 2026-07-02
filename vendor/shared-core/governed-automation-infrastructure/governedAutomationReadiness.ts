import { GovernedAutomationRequest } from "./governedAutomationContracts";

export function getMissingGovernanceRequirements(request: GovernedAutomationRequest): string[] {
  const missing: string[] = [];

  if (!request.ariReady) missing.push("ARI readiness missing");
  if (!request.tisAuthority) missing.push("TIS consequence authority missing");
  if (!request.vapProofReady) missing.push("VAP proof readiness missing");
  if (request.humanCustodyRequired && !request.humanCustodyPresent) {
    missing.push("Human custody required but absent");
  }

  return missing;
}
