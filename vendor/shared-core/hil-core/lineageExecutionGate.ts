import { verifyLineageChain } from '../lineage-gate/lineageGate';

export function enforceLineage(input: any[]) {
  const result = verifyLineageChain(input);

  if (result.decision !== "ALLOW") {
    return {
      decision: "REFUSE",
      reason: result.reason
    };
  }

  return {
    decision: "ALLOW"
  };
}
