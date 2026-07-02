import { evaluateIngress, IngressInput } from '../ingress-gate/ingressGate';

export type HeldResolutionInput = {
  originalInput: IngressInput;
  patch: Partial<IngressInput>;
};

export function resolveHeldIngress(input: HeldResolutionInput) {
  const firstPass = evaluateIngress(input.originalInput);

  if (firstPass.decision !== "HELD") {
    return {
      status: "NO_HELD_RESOLUTION_REQUIRED",
      firstPass
    };
  }

  const repairedInput = {
    ...input.originalInput,
    ...input.patch
  };

  const secondPass = evaluateIngress(repairedInput);

  return {
    status: secondPass.decision === "ACCEPTED"
      ? "HELD_RESOLVED"
      : "HELD_NOT_RESOLVED",
    firstPass,
    repairedInput,
    secondPass
  };
}
