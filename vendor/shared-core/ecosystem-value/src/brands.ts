import type { BrandedSurfaceManifest, LockboxPolicy } from "./contracts.js";

export function createPaiSafeWalletManifest(): BrandedSurfaceManifest {
  return {
    surface: "PAI_SAFE_WALLET",
    displayName: "PAI-SAFE Wallet",
    coreCapability: "Governed value storage, auto-conversion, jurisdiction-aware settlement, and trust-backed loyalty.",
    usesWalletLayer: true,
    usesLockboxLayer: false,
    trustWrapped: false,
  };
}

export function createTruFitDigitalLockboxManifest(): BrandedSurfaceManifest {
  return {
    surface: "TRUFIT_DIGITAL_LOCKBOX",
    displayName: "TRUFiT Digital Lockbox",
    coreCapability: "Presence-first perimeter protecting governed assets and value through adaptive lockbox policy.",
    usesWalletLayer: true,
    usesLockboxLayer: true,
    trustWrapped: false,
  };
}

export function createDefaultTruFitLockboxPolicy(): LockboxPolicy {
  return {
    policyId: "trufit-lockbox-policy-v1",
    presenceLevel: "duress-aware",
    duressAware: true,
    requiredTrustTier: "verified",
    protectedValueKinds: [
      "stable_value",
      "reserved_value",
      "merchant_credit",
      "service_credit",
    ],
    allowDecoyResponse: true,
  };
}
