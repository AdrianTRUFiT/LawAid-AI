import { getFinTechionStoreState } from "../../lib/fintechion";

export function getOversightStateApi() {
  const state = getFinTechionStoreState();

  if (!state.latestOversightState) {
    return {
      ok: false,
      message: "No oversight state has been built yet.",
    };
  }

  return {
    ok: true,
    artifactType: "GovernedFinancialOversightState",
    payload: state.latestOversightState,
  };
}
