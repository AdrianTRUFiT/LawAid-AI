import {
  buildAndStoreOversightState,
  recordOversightArtifact,
} from "../../lib/fintechion";

export function buildOversightStateApi(
  period: string,
  refundExposure = 0,
  disputeExposure = 0,
) {
  const oversight = buildAndStoreOversightState(
    period,
    refundExposure,
    disputeExposure,
  );
  recordOversightArtifact(oversight);

  return {
    ok: true,
    artifactType: "GovernedFinancialOversightState",
    payload: oversight,
  };
}
