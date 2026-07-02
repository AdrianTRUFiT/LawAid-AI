import type {
  SeamIntegrityContext,
  SeamIntegrityResult
} from '../contracts/seam-integrity'

export function evaluateSeamIntegrity(
  ctx: SeamIntegrityContext
): SeamIntegrityResult {
  if (!ctx.upstream.identityVerified || !ctx.upstream.authorshipAllowed || !ctx.upstream.passageBound) {
    return {
      action: 'REFUSE',
      reason: 'CROSS_CONSISTENCY_MISMATCH',
      severity: 'HIGH',
      fallback: 'SAFE_HOLD'
    }
  }

  if (ctx.presence.sessionActive && !ctx.presence.authorshipContinuity) {
    return {
      action: 'ESCALATE',
      reason: 'CROSS_CONSISTENCY_MISMATCH',
      severity: 'HIGH',
      fallback: 'REVIEW_QUEUE'
    }
  }

  if (ctx.consequence.irreversible) {
    if (
      ctx.upstream.trustPosture !== 'FULL' ||
      ctx.presence.authorshipProofLevel !== 'STRONG' ||
      !ctx.presence.authorshipContinuity
    ) {
      return {
        action: 'REFUSE',
        reason: 'CONSEQUENCE_GATE_MISMATCH',
        severity: 'HIGH',
        fallback: 'SAFE_HOLD'
      }
    }
  }

  if (ctx.sequence.currentStep !== ctx.sequence.expectedStep) {
    return {
      action: 'REFUSE',
      reason: 'SEQUENCE_INVALID',
      severity: 'HIGH',
      fallback: 'SAFE_HOLD'
    }
  }

  if (!ctx.sequence.lineageMatches) {
    return {
      action: 'REFUSE',
      reason: 'LINEAGE_REFERENCE_MISMATCH',
      severity: 'HIGH',
      fallback: 'SAFE_HOLD'
    }
  }

  if (
    ctx.sequence.priorArtifactId &&
    ctx.sequence.lineageRef &&
    ctx.sequence.priorArtifactId !== ctx.sequence.lineageRef
  ) {
    return {
      action: 'REFUSE',
      reason: 'LINEAGE_REFERENCE_MISMATCH',
      severity: 'HIGH',
      fallback: 'SAFE_HOLD'
    }
  }

  if (ctx.timing.elapsedMs < ctx.timing.minMs || ctx.timing.elapsedMs > ctx.timing.maxMs) {
    return {
      action: 'ESCALATE',
      reason: 'TIMING_WINDOW_MISMATCH',
      severity: 'WARN',
      fallback: 'REVIEW_QUEUE'
    }
  }

  if (ctx.target.intendedTarget !== ctx.target.actualTarget) {
    return {
      action: 'REFUSE',
      reason: 'SUBSTITUTION_RISK',
      severity: 'HIGH',
      fallback: 'QUARANTINE'
    }
  }

  if (
    ctx.target.expectedPayloadHash &&
    ctx.target.payloadHash &&
    ctx.target.expectedPayloadHash !== ctx.target.payloadHash
  ) {
    return {
      action: 'REFUSE',
      reason: 'SUBSTITUTION_RISK',
      severity: 'HIGH',
      fallback: 'QUARANTINE'
    }
  }

  if (ctx.consequence.passageScopeCount !== ctx.consequence.allowedScopeCount) {
    return {
      action: 'REFUSE',
      reason: 'PIGGYBACK_RISK',
      severity: 'HIGH',
      fallback: 'QUARANTINE'
    }
  }

  if (!ctx.continuity.continuityVerified) {
    return {
      action: 'MARK_CONTINUITY_RISK',
      reason: 'CONTINUITY_MISMATCH',
      severity: 'HIGH',
      fallback: 'REVIEW_QUEUE'
    }
  }

  if (ctx.pressure.decoySinkDetected) {
    return {
      action: 'TRAP',
      reason: 'DECOY_SINK_PATTERN',
      severity: 'HIGH',
      fallback: 'TRAP'
    }
  }

  if (ctx.pressure.mimicPatternDetected || ctx.pressure.exhaustionRisk || ctx.pressure.repeatedAttempts >= 5) {
    return {
      action: 'PROCEED_REDUCED_TRUST',
      reason: 'PRESSURE_DEGRADATION_RISK',
      severity: 'WARN',
      fallback: 'REVIEW_QUEUE'
    }
  }

  return {
    action: 'PROCEED',
    reason: 'SEAM_COHERENT',
    severity: 'INFO',
    fallback: 'NONE'
  }
}
