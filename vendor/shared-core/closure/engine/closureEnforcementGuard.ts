import type {
  ClosureInputs,
  EnforcedClosureState
} from '../contracts/closureStateContracts'
import { validateClosureRights } from '../contracts/closureRightsValidators'
import { validateClosureRelease } from '../contracts/closureReleaseGuards'
import { validateClosureBypass } from '../contracts/closureBypassGuards'
import { applyClosureOverridePolicy } from '../contracts/closureOverridePolicy'
import { ClosureReasonCodes } from '../contracts/closureReasonCodes'

export function enforceClosure(input: ClosureInputs): EnforcedClosureState {
  const bypassReasons = validateClosureBypass(input)
  if (bypassReasons.length > 0) {
    return {
      enforcedClosureState: 'REFUSED',
      enforcementReasons: bypassReasons,
      overrideApplied: false,
      overrideType: 'NONE',
      fallbackOrEscalationRoute: 'BYPASS_INVESTIGATION',
      attestationRequired: true,
      finalConnectionHonored: false
    }
  }

  const rightsReasons = validateClosureRights(input)
  if (rightsReasons.includes(ClosureReasonCodes.CUSTODY_INVALID) ||
      rightsReasons.includes(ClosureReasonCodes.ENTITLEMENT_FALSE) ||
      rightsReasons.includes(ClosureReasonCodes.OWNERSHIP_INVALID)) {
    return {
      enforcedClosureState: 'REFUSED',
      enforcementReasons: rightsReasons,
      overrideApplied: false,
      overrideType: 'NONE',
      fallbackOrEscalationRoute: 'RIGHTS_REVIEW',
      attestationRequired: true,
      finalConnectionHonored: false
    }
  }

  if (rightsReasons.includes(ClosureReasonCodes.PAYMENT_WITHOUT_AUTHORITY)) {
    const held = {
      enforcedClosureState: 'HELD',
      enforcementReasons: rightsReasons,
      overrideApplied: false,
      overrideType: 'NONE' as const,
      fallbackOrEscalationRoute: 'SAFE_HOLD' as const,
      attestationRequired: true,
      finalConnectionHonored: false
    }
    return applyClosureOverridePolicy(input, held)
  }

  const releaseReasons = validateClosureRelease(input)
  if (releaseReasons.includes(ClosureReasonCodes.RELEASE_PREMATURE)) {
    const held = {
      enforcedClosureState: 'HELD',
      enforcementReasons: releaseReasons,
      overrideApplied: false,
      overrideType: 'NONE' as const,
      fallbackOrEscalationRoute: 'SAFE_HOLD' as const,
      attestationRequired: false,
      finalConnectionHonored: false
    }
    return applyClosureOverridePolicy(input, held)
  }

  if (releaseReasons.length > 0) {
    const constrained = {
      enforcedClosureState: 'CONSTRAINED',
      enforcementReasons: releaseReasons,
      overrideApplied: false,
      overrideType: 'NONE' as const,
      fallbackOrEscalationRoute: 'REVIEW_QUEUE' as const,
      attestationRequired: false,
      finalConnectionHonored: false
    }
    return applyClosureOverridePolicy(input, constrained)
  }

  return {
    enforcedClosureState: 'CLEARED',
    enforcementReasons: [],
    overrideApplied: false,
    overrideType: 'NONE',
    fallbackOrEscalationRoute: 'NONE',
    attestationRequired: false,
    finalConnectionHonored: true
  }
}
