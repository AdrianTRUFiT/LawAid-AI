import type { RuntimeTruthInput } from "./closureStateContracts";

export type ContinuityInspection = {
  continuityStatus: RuntimeTruthInput["continuityState"]["continuityStatus"];
  supportStatus: RuntimeTruthInput["supportState"]["supportStatus"];
  falseVisibleReadiness: boolean;
  degradedInternalSupport: boolean;
  unresolvedContinuity: boolean;
  brokenContinuity: boolean;
  hardInvalid: boolean;
};

export function inspectRuntimeContinuity(truth: RuntimeTruthInput): ContinuityInspection {
  const falseVisibleReadiness =
    truth.runtimeState.visibleReady &&
    (
      !truth.runtimeState.activeState ||
      !truth.runtimeState.reviewed ||
      !truth.runtimeState.proposalAttachable ||
      truth.continuityState.continuityStatus !== "INTACT" ||
      truth.supportState.supportStatus === "BROKEN" ||
      truth.supportState.supportStatus === "ORPHANED"
    );

  const degradedInternalSupport = truth.supportState.supportStatus === "DEGRADED";
  const unresolvedContinuity = truth.continuityState.continuityStatus === "UNRESOLVED";
  const brokenContinuity = truth.continuityState.continuityStatus === "BROKEN";
  const hardInvalid = !truth.runtimeState.proposalAttachable;

  return {
    continuityStatus: truth.continuityState.continuityStatus,
    supportStatus: truth.supportState.supportStatus,
    falseVisibleReadiness,
    degradedInternalSupport,
    unresolvedContinuity,
    brokenContinuity,
    hardInvalid
  };
}
