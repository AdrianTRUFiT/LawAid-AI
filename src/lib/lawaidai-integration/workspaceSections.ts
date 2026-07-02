import type {
  LawAidAIShellMode,
  LawAidAIShellSections,
} from "./integrationContracts";

export function deriveVisibleSections(shellMode: LawAidAIShellMode): LawAidAIShellSections {
  switch (shellMode) {
    case "blocked":
      return {
        overview: false,
        checklist: false,
        evidence: false,
        timeline: false,
        costs: false,
        communications: false,
        billing: true,
        activation: true,
      };

    case "read_only":
      return {
        overview: true,
        checklist: true,
        evidence: true,
        timeline: true,
        costs: true,
        communications: true,
        billing: true,
        activation: false,
      };

    case "billing_gate":
      return {
        overview: true,
        checklist: false,
        evidence: false,
        timeline: false,
        costs: false,
        communications: false,
        billing: true,
        activation: false,
      };

    case "activation_ready":
      return {
        overview: true,
        checklist: true,
        evidence: true,
        timeline: true,
        costs: true,
        communications: true,
        billing: true,
        activation: true,
      };

    case "active":
    default:
      return {
        overview: true,
        checklist: true,
        evidence: true,
        timeline: true,
        costs: true,
        communications: true,
        billing: true,
        activation: false,
      };
  }
}
