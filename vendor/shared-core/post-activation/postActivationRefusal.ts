import type { PostActivationResult } from './postActivationContracts'

export function mapPostActivationRefusal(result: PostActivationResult) {
  if (result.decision === 'ALLOW') {
    return {
      route: 'CONTINUE',
      writeAllowed: true,
      propagationAllowed: true
    }
  }

  if (result.decision === 'HOLD') {
    return {
      route: 'SAFE_HOLD',
      writeAllowed: false,
      propagationAllowed: false
    }
  }

  if (result.decision === 'BLOCK_PROPAGATION') {
    return {
      route: 'BLOCK_PROPAGATION',
      writeAllowed: false,
      propagationAllowed: false
    }
  }

  return {
    route: 'REFUSE',
    writeAllowed: false,
    propagationAllowed: false
  }
}
