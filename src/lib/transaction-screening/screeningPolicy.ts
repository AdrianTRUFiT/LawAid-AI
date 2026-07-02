import type { ScreeningPolicy } from "./screeningContracts";
import type { ScreeningMode } from "./screeningTypes";

export function createDefaultScreeningPolicy(
  mode: ScreeningMode = "disabled"
): ScreeningPolicy {
  return {
    policyId: `screening-policy-${mode}`,
    mode,
    rules: {
      sanctions: {
        id: "rule_sanctions",
        enabled: true,
        severityOnTrigger: "critical",
      },
      kyc: {
        id: "rule_kyc",
        enabled: true,
        severityOnTrigger: "high",
      },
      duplicate: {
        id: "rule_duplicate",
        enabled: true,
        severityOnTrigger: "high",
      },
      velocity: {
        id: "rule_velocity",
        enabled: true,
        threshold: 5,
        severityOnTrigger: "medium",
      },
      amountThreshold: {
        id: "rule_amount_threshold",
        enabled: true,
        threshold: 10000,
        severityOnTrigger: "medium",
      },
      countryRestriction: {
        id: "rule_country_restriction",
        enabled: true,
        blockedCountries: ["IR", "KP", "SY", "CU"],
        severityOnTrigger: "critical",
      },
      contradictoryMetadata: {
        id: "rule_contradictory_metadata",
        enabled: true,
        severityOnTrigger: "medium",
      },
    },
  };
}
