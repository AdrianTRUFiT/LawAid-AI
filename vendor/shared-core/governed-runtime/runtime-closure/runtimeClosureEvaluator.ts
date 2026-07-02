import { makeClosureDecisionEnvelope } from "./closureDecisionEnvelope";
import { resolveClosureState } from "./closureStateResolver";
import type {
  ClosureDecisionEnvelope,
  ClosureReason,
  ProposalContext,
  RuntimeTruthInput
} from "./closureStateContracts";

function collectReasons(proposal: ProposalContext, truth: RuntimeTruthInput): ClosureReason[] {
  const reasons: ClosureReason[] = [];

  if (!proposal.proposalId || !proposal.proposedAction) {
    reasons.push("HARD_INVALID_PROPOSAL");
  }

  if (!truth.runtimeState.proposalAttachable) {
    reasons.push("PROPOSAL_NOT_ATTACHABLE");
  }

  if (
    truth.runtimeState.visibleReady &&
    (
      !truth.runtimeState.activeState ||
      !truth.runtimeState.reviewed ||
      truth.continuityState.continuityStatus !== "INTACT" ||
      truth.supportState.supportStatus === "BROKEN" ||
      truth.supportState.supportStatus === "ORPHANED"
    )
  ) {
    reasons.push("VISIBLE_READINESS_FALSE");
  }

  switch (truth.supportState.supportStatus) {
    case "BROKEN":
      reasons.push("SUPPORT_BROKEN");
      break;
    case "ORPHANED":
      reasons.push("SUPPORT_ORPHANED");
      break;
    case "DEGRADED":
      reasons.push("SUPPORT_DEGRADED");
      break;
  }

  switch (truth.continuityState.continuityStatus) {
    case "BROKEN":
      reasons.push("CONTINUITY_BROKEN");
      break;
    case "UNRESOLVED":
      reasons.push("CONTINUITY_UNRESOLVED");
      break;
  }

  switch (truth.timingState.timingStatus) {
    case "EXPIRED":
      reasons.push("TIMING_EXPIRED");
      break;
    case "STALE":
      reasons.push("TIMING_STALE");
      break;
  }

  switch (truth.hazardState.hazardStatus) {
    case "ACTIVE":
      reasons.push("HAZARD_ACTIVE");
      break;
    case "ELEVATED":
      reasons.push("HAZARD_ELEVATED");
      break;
  }

  switch (truth.maturityState.maturityStatus) {
    case "INSUFFICIENT":
      reasons.push("MATURITY_INSUFFICIENT");
      break;
    case "EARLY":
      reasons.push("MATURITY_EARLY");
      break;
  }

  if ((truth.anomalyState?.anomalySignals.length ?? 0) > 0) {
    reasons.push("ANOMALY_PRESENT");
  }

  if (reasons.length === 0) {
    reasons.push("READY");
  } else {
    const closure = resolveClosureState(reasons);
    if (closure === "CONSTRAINED") {
      reasons.push("READY_WITH_LIMITS");
    }
  }

  return Array.from(new Set(reasons));
}

export function evaluateRuntimeClosure(
  proposal: ProposalContext,
  truth: RuntimeTruthInput
): ClosureDecisionEnvelope {
  const runtimeReasons = collectReasons(proposal, truth);
  const runtimeClosureState = resolveClosureState(runtimeReasons);
  const connectionHonorable = runtimeClosureState === "CLEARED" || runtimeClosureState === "CONSTRAINED";
  const proofRequired = runtimeClosureState !== "CLEARED";

  return makeClosureDecisionEnvelope({
    proposalId: proposal.proposalId,
    proposedAction: proposal.proposedAction,
    runtimeClosureState,
    runtimeReasons,
    continuityStatus: truth.continuityState.continuityStatus,
    supportStatus: truth.supportState.supportStatus,
    hazardStatus: truth.hazardState.hazardStatus,
    maturityStatus: truth.maturityState.maturityStatus,
    connectionHonorable,
    proofRequired,
    timestamp: new Date().toISOString()
  });
}
