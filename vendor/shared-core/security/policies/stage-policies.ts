import type { SecurityContext, SecurityStage } from '../contracts'

type StagePolicy = {
  requireVerifiedAuthorship: boolean
  requireVerifiedOwnership: boolean
  requireReviewed: boolean
  requireApproved: boolean
}

export const stagePolicies: Record<SecurityStage, StagePolicy> = {
  Recruit: {
    requireVerifiedAuthorship: true,
    requireVerifiedOwnership: false,
    requireReviewed: false,
    requireApproved: false
  },
  Acquire: {
    requireVerifiedAuthorship: true,
    requireVerifiedOwnership: true,
    requireReviewed: true,
    requireApproved: false
  },
  Transact: {
    requireVerifiedAuthorship: true,
    requireVerifiedOwnership: true,
    requireReviewed: true,
    requireApproved: false
  },
  Engage: {
    requireVerifiedAuthorship: true,
    requireVerifiedOwnership: true,
    requireReviewed: true,
    requireApproved: true
  }
}

export function getStagePolicy(stage: SecurityContext['stage']) {
  return stagePolicies[stage]
}
