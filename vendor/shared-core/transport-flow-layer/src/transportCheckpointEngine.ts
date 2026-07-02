import type {
  CheckpointDecision,
  CheckpointEvaluationInput,
  CheckpointEvaluationResult,
  MovementState,
  ProofArtifactType,
} from "./transportTypes.js";
import { createProofArtifact } from "./transportProofArtifacts.js";

function mapDecisionToState(
  decision: CheckpointDecision,
  checkpointType: CheckpointEvaluationInput["checkpointType"],
): MovementState {
  switch (decision) {
    case "PASS":
      if (checkpointType === "origin_validation") return "READY_FOR_PICKUP";
      if (checkpointType === "consolidation_gate") return "CONSOLIDATED";
      if (checkpointType === "border_compliance") return "CLEARED";
      if (checkpointType === "storage_routing") return "STAGED";
      if (checkpointType === "final_mile_readiness") return "OUT_FOR_DELIVERY";
      if (checkpointType === "receiver_confirmation") return "DELIVERED";
      return "IN_TRANSIT";
    case "HOLD":
      return "HELD";
    case "REVIEW":
      return "AT_BORDER_REVIEW";
    case "REROUTE":
      return "REROUTED";
    case "SPLIT":
      return "DECONSOLIDATED";
    case "CONSOLIDATE":
      return "CONSOLIDATED";
    case "REFUSE":
      return "REFUSED";
  }
}

function mapDecisionToArtifactType(
  decision: CheckpointDecision,
  checkpointType: CheckpointEvaluationInput["checkpointType"],
): ProofArtifactType {
  if (checkpointType === "origin_validation" && decision === "PASS") return "pickup_proof";
  if (checkpointType === "border_compliance" && decision === "PASS") return "compliance_clearance";
  if (checkpointType === "receiver_confirmation" && decision === "PASS") return "delivery_confirmation";
  if (decision === "HOLD" || decision === "REVIEW" || decision === "REROUTE" || decision === "REFUSE") {
    return "exception_note";
  }
  return "checkpoint_decision";
}

export function evaluateCheckpoint(
  input: CheckpointEvaluationInput,
): CheckpointEvaluationResult {
  let decision: CheckpointDecision = "PASS";
  let reason = "Checkpoint passed.";
  let downstreamInstruction: string | undefined;

  if (input.checkpointType === "origin_validation") {
    if (!input.docsComplete || !input.ownerConfirmed) {
      decision = "HOLD";
      reason = "Origin requirements incomplete.";
      downstreamInstruction = "Complete origin validation before pickup.";
    }
  } else if (input.checkpointType === "consolidation_gate") {
    if (!input.compatibleForConsolidation || !input.routeJustified) {
      decision = "REROUTE";
      reason = "Flow unit should not enter this consolidation path.";
      downstreamInstruction = input.rerouteTargetNodeId
        ? `Reroute to ${input.rerouteTargetNodeId}.`
        : "Reroute required.";
    } else {
      decision = "CONSOLIDATE";
      reason = "Flow unit approved for consolidation.";
      downstreamInstruction = "Add to consolidation group.";
    }
  } else if (input.checkpointType === "border_compliance") {
    if (input.requiresReview) {
      decision = "REVIEW";
      reason = "Compliance review required.";
      downstreamInstruction = "Send to controlled compliance review.";
    } else if (!input.complianceCleared) {
      decision = "HOLD";
      reason = "Compliance not cleared.";
      downstreamInstruction = "Hold until lawful clearance exists.";
    }
  } else if (input.checkpointType === "storage_routing") {
    if (input.splitRequired) {
      decision = "SPLIT";
      reason = "Flow must be split before downstream movement.";
      downstreamInstruction = "Deconsolidate and allocate by destination.";
    }
  } else if (input.checkpointType === "final_mile_readiness") {
    if (!input.endpointReady) {
      decision = "HOLD";
      reason = "Endpoint not ready for final-mile movement.";
      downstreamInstruction = "Stage until endpoint readiness exists.";
    }
  } else if (input.checkpointType === "receiver_confirmation") {
    if (!input.endpointReady) {
      decision = "REFUSE";
      reason = "Receiver confirmation failed.";
      downstreamInstruction = "Refuse completion and open exception chain.";
    }
  }

  const proofArtifact = createProofArtifact({
    artifactType: mapDecisionToArtifactType(decision, input.checkpointType),
    flowUnitId: input.flowUnit.flowUnitId,
    nodeId: input.node.nodeId,
    payload: {
      checkpointId: input.checkpointId,
      checkpointType: input.checkpointType,
      decision,
      reason,
      actor: input.actor,
      downstreamInstruction,
    },
  });

  return {
    checkpoint: {
      checkpointId: input.checkpointId,
      checkpointType: input.checkpointType,
      nodeId: input.node.nodeId,
      decision,
      decisionReason: reason,
      timestamp: new Date().toISOString(),
      actor: input.actor,
      downstreamInstruction,
      proofArtifactId: proofArtifact.artifactId,
    },
    proofArtifact,
    suggestedNextState: mapDecisionToState(decision, input.checkpointType),
  };
}