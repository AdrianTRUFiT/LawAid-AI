import type {
  EcosystemWalletProfile,
  LockboxDecision,
  LockboxPolicy,
  PresenceSnapshot,
} from "./contracts.js";

const TRUST_ORDER: Record<EcosystemWalletProfile["trustTier"], number> = {
  starter: 1,
  verified: 2,
  trusted: 3,
  institutional: 4,
};

export function evaluateLockboxOpen(input: {
  wallet: EcosystemWalletProfile;
  policy: LockboxPolicy;
  presence: PresenceSnapshot;
}): LockboxDecision {
  if (
    input.policy.requiredTrustTier &&
    TRUST_ORDER[input.wallet.trustTier] < TRUST_ORDER[input.policy.requiredTrustTier]
  ) {
    return {
      approved: false,
      state: "escalated",
      reason: "Wallet trust tier is below lockbox requirement.",
      escalationRequired: true,
      decoyRecommended: false,
    };
  }

  if (input.policy.duressAware && input.presence.duressConfidence >= 0.7) {
    return {
      approved: false,
      state: "escalated",
      reason: "Duress confidence exceeded threshold.",
      escalationRequired: true,
      decoyRecommended: input.policy.allowDecoyResponse,
    };
  }

  if (input.policy.presenceLevel === "level-1" && !input.presence.deviceBound) {
    return {
      approved: false,
      state: "sealed",
      reason: "Device binding required.",
      escalationRequired: false,
      decoyRecommended: false,
    };
  }

  if (input.policy.presenceLevel === "level-2") {
    if (
      !input.presence.deviceBound ||
      !input.presence.biometricSatisfied ||
      !input.presence.journalingDeltaAccepted
    ) {
      return {
        approved: false,
        state: "sealed",
        reason: "Presence level-2 requirements not satisfied.",
        escalationRequired: false,
        decoyRecommended: false,
      };
    }
  }

  if (input.policy.presenceLevel === "level-3" || input.policy.presenceLevel === "duress-aware") {
    if (
      !input.presence.deviceBound ||
      !input.presence.biometricSatisfied ||
      !input.presence.journalingDeltaAccepted ||
      input.presence.behaviorScore < 0.8
    ) {
      return {
        approved: false,
        state: "sealed",
        reason: "Presence level-3 requirements not satisfied.",
        escalationRequired: false,
        decoyRecommended: false,
      };
    }
  }

  return {
    approved: true,
    state: "open",
    reason: "Lockbox open approved.",
    escalationRequired: false,
    decoyRecommended: false,
  };
}
