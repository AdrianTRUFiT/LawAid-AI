import crypto from 'node:crypto'
import type { HilEnforcementInput, HilEnforcementSeal } from './hilEnforcementContracts'

export function sealEnforcementInput(input: HilEnforcementInput): HilEnforcementSeal {
  const runtimeHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(input.runtime))
    .digest('hex')

  const governanceHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(input.governance))
    .digest('hex')

  const combinedHash = crypto
    .createHash('sha256')
    .update(runtimeHash + governanceHash)
    .digest('hex')

  return {
    runtimeHash,
    governanceHash,
    combinedHash
  }
}
