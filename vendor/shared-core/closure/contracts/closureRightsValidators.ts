import type { ClosureInputs } from './closureStateContracts'
import { ClosureReasonCodes } from './closureReasonCodes'

export function validateClosureRights(input: ClosureInputs): string[] {
  const reasons: string[] = []

  if (input.paymentConfirmed && !input.authorityValid) {
    reasons.push(ClosureReasonCodes.PAYMENT_WITHOUT_AUTHORITY)
  }

  if (!input.custodyValid) {
    reasons.push(ClosureReasonCodes.CUSTODY_INVALID)
  }

  if (!input.ownershipValid) {
    reasons.push(ClosureReasonCodes.OWNERSHIP_INVALID)
  }

  if (!input.entitlementValid) {
    reasons.push(ClosureReasonCodes.ENTITLEMENT_FALSE)
  }

  return reasons
}
