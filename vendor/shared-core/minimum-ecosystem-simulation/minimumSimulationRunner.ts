import { createSimulationArtifact } from './simulationArtifactEngine';

export function runMinimumEcosystemSimulation() {
  const raw = createSimulationArtifact({
    type: "RAW_SIGNAL",
    node: "SIGNAL"
  });

  const captured = createSimulationArtifact({
    type: "CAPTURED_SIGNAL",
    node: "INTAKE",
    parentArtifact: raw as any
  });

  const verified = createSimulationArtifact({
    type: "VERIFIED_OPPORTUNITY",
    node: "QUALIFICATION",
    parentArtifact: captured as any
  });

  const activated = createSimulationArtifact({
    type: "ACTIVATED_TRANSACTION_STATE",
    node: "TRANSACTION",
    parentArtifact: verified as any
  });

  const live = createSimulationArtifact({
    type: "LIVE_SYSTEM_RECORD",
    node: "FULFILLMENT",
    parentArtifact: activated as any
  });

  const closure = createSimulationArtifact({
    type: "CLOSURE_RECORD",
    node: "CLOSURE",
    parentArtifact: live as any
  });

  const invalid = createSimulationArtifact({
    type: "LIVE_SYSTEM_RECORD",
    node: "FULFILLMENT",
    parentArtifact: captured as any
  });

  return {
    status: "MINIMUM_ECOSYSTEM_SIMULATION_COMPLETE",
    passPath: [raw, captured, verified, activated, live, closure],
    refusalPath: invalid
  };
}
