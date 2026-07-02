import { enforceClosure } from '../../../AIVA/shared-core/closure/engine/closureEnforcementGuard'
import type { ClosureInputs } from '../../../AIVA/shared-core/closure/contracts/closureStateContracts'

export type LawAidActivationClosureEvent = {
  activationId: string
  runtimeReady: boolean
  governanceReady: boolean
  paymentConfirmed: boolean
  authorityValid: boolean
  custodyValid: boolean
  ownershipValid: boolean
  entitlementValid: boolean
  releaseValid: boolean
  bypassDetected: boolean
  attestationPresent: boolean
}

export function runLawAidActivationClosure(event: LawAidActivationClosureEvent) {
  const input: ClosureInputs = {
    closureId: event.activationId,
    runtimeReady: event.runtimeReady,
    governanceReady: event.governanceReady,
    paymentConfirmed: event.paymentConfirmed,
    authorityValid: event.authorityValid,
    custodyValid: event.custodyValid,
    ownershipValid: event.ownershipValid,
    entitlementValid: event.entitlementValid,
    releaseValid: event.releaseValid,
    bypassDetected: event.bypassDetected,
    attestationPresent: event.attestationPresent
  }

  const enforced = enforceClosure(input)

  return {
    seam: 'LawAidAI',
    activationId: event.activationId,
    enforced
  }
}
