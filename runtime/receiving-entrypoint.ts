import type { SecurityContext } from '../../shared-core/security/contracts'
import { evaluateWithThreat } from '../../shared-core/security/engine/evaluate-with-threat'
import { enforceSecurity } from '../../shared-core/security/engine/enforce-security'
import { enforceSecurityWrite } from '../../shared-core/security/engine/enforced-write'
import { recordLawAidEvent } from '../../shared-core/security/engine/lawaid-hook'

export type LawAidRuntimeEvent = {
  recordId: string
  source: string
  context?: string
  reason?: string

  authorshipOriginId: string | null
  authorshipVerified: boolean

  ownershipOwnerId: string | null
  ownershipVerified: boolean

  custodyHolderId: string | null
  custodyType: 'temporary' | 'storage' | 'processing'

  entitlementAllowed: boolean
  entitlementBasis: 'contract' | 'verification' | 'none'

  reviewed: boolean
  approved: boolean
}

export function toSecurityContext(evt: LawAidRuntimeEvent): SecurityContext {
  return {
    artifactId: evt.recordId,
    artifactType: 'LiveSystemRecord',
    stage: 'Engage',

    authorship: {
      originId: evt.authorshipOriginId,
      verified: evt.authorshipVerified
    },

    ownership: {
      ownerId: evt.ownershipOwnerId,
      verified: evt.ownershipVerified
    },

    custody: {
      holderId: evt.custodyHolderId,
      type: evt.custodyType
    },

    entitlement: {
      allowed: evt.entitlementAllowed,
      basis: evt.entitlementBasis
    },

    payment: {
      exists: false,
      amount: undefined,
      linkedToOwnership: false
    },

    verification: {
      reviewed: evt.reviewed,
      approved: evt.approved
    }
  }
}

export function processLawAidRuntimeEvent(evt: LawAidRuntimeEvent) {
  const ctx = toSecurityContext(evt)

  const evaluation = evaluateWithThreat(ctx)
  const enforcement = enforceSecurity(ctx)

  enforceSecurityWrite({
    artifactId: evt.recordId,
    artifactType: 'LiveSystemRecord',
    stage: 'Engage',
    decision: 'LAWAID_RUNTIME_ENTRYPOINT',
    reason: enforcement.reason,
    threat: enforcement.threat,
    enforcement: enforcement.status,
    action: enforcement.action,
    source: evt.source,
    context: evt.context
  })

  if (enforcement.status === 'EXECUTED') {
    recordLawAidEvent({
      recordId: evt.recordId,
      source: evt.source,
      context: evt.context,
      reason: evt.reason ?? 'LAW_AID_INTAKE'
    })
  }

  return {
    ctx,
    evaluation,
    enforcement
  }
}
