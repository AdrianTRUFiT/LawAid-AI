import type { SeamIntegrityContext } from '../contracts/seam-integrity'
import { evaluateSeamIntegrity } from './evaluate-seam-integrity'
import { enforceSecurityWrite } from './enforced-write'

export function enforceSeamIntegrity(ctx: SeamIntegrityContext) {
  const result = evaluateSeamIntegrity(ctx)

  const enforcement =
    result.action === 'PROCEED'
      ? 'EXECUTED'
      : result.action === 'PROCEED_REDUCED_TRUST'
        ? 'ESCALATED'
        : result.action === 'ESCALATE'
          ? 'ESCALATED'
          : result.action === 'MARK_CONTINUITY_RISK'
            ? 'ESCALATED'
            : result.action === 'SURFACE_ANOMALY'
              ? 'ESCALATED'
              : 'BLOCKED'

  enforceSecurityWrite({
    artifactId: ctx.artifactId,
    artifactType: 'SeamIntegrityGate',
    stage: ctx.stage,
    decision: 'SEAM_INTEGRITY_CHECK',
    reason: result.reason,
    threat: result.action === 'PROCEED' ? 'NONE' : 'SEAM_INTEGRITY_RISK',
    enforcement,
    action: result.action,
    severity: result.severity,
    fallback: result.fallback,
    actorId: ctx.actorId,
    trustPosture: ctx.upstream.trustPosture,
    authorshipProofLevel: ctx.presence.authorshipProofLevel,
    authorshipContinuity: ctx.presence.authorshipContinuity,
    intendedTarget: ctx.target.intendedTarget,
    actualTarget: ctx.target.actualTarget,
    currentStep: ctx.sequence.currentStep,
    expectedStep: ctx.sequence.expectedStep,
    lineageRef: ctx.sequence.lineageRef,
    passageScopeCount: ctx.consequence.passageScopeCount,
    allowedScopeCount: ctx.consequence.allowedScopeCount,
    repeatedAttempts: ctx.pressure.repeatedAttempts,
    mimicPatternDetected: ctx.pressure.mimicPatternDetected,
    decoySinkDetected: ctx.pressure.decoySinkDetected,
    exhaustionRisk: ctx.pressure.exhaustionRisk
  })

  return result
}
