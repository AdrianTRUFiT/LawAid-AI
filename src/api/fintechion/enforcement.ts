import { buildOversightEnforcementState } from "../../lib/fintechion";
import type { GovernedFinancialOversightState } from "../../lib/fintechion/types";

export function buildOversightEnforcementApi(
  oversight: GovernedFinancialOversightState,
) {
  return {
    ok: true,
    artifactType: "OversightEnforcementState",
    payload: buildOversightEnforcementState(oversight),
  };
}
