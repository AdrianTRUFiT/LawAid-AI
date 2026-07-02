import {
  createDefaultTruFitLockboxPolicy,
  previewLockboxDecision,
  type EcosystemWalletProfile,
  type PresenceSnapshot,
} from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_003",
  ownerId: "owner_003",
  homeJurisdiction: "US",
  trustTier: "trusted",
  balances: [],
};

const presence: PresenceSnapshot = {
  ownerId: "owner_003",
  deviceBound: true,
  biometricSatisfied: true,
  behaviorScore: 0.91,
  duressConfidence: 0.05,
  journalingDeltaAccepted: true,
};

const decision = previewLockboxDecision({
  wallet,
  policy: createDefaultTruFitLockboxPolicy(),
  presence,
});

if (!decision.approved || decision.state !== "open") {
  throw new Error(`Expected lockbox open but got ${decision.state}`);
}

console.log("SMOKE_SHARED_VALUE_LOCKBOX=PASS");
