import { buildComplianceSnapshot } from "./compliance.js";
import type {
  EcosystemWalletProfile,
  JurisdictionPolicy,
  LockboxDecision,
  LockboxPolicy,
  PresenceSnapshot,
  RailCapability,
  RealValuePrice,
  SettlementRecord,
  ValueConversionRate,
  WalletDecision,
} from "./contracts.js";
import { autoSelectFunding } from "./walletEngine.js";
import { buildLoyaltySnapshot } from "./loyalty.js";
import { evaluateLockboxOpen } from "./lockboxEngine.js";

export function previewWalletDecision(input: {
  wallet: EcosystemWalletProfile;
  price: RealValuePrice;
  policy: JurisdictionPolicy;
  rails: RailCapability[];
  rates: ValueConversionRate[];
  hasKyc: boolean;
}): WalletDecision {
  const compliance = buildComplianceSnapshot({
    wallet: input.wallet,
    merchantId: input.price.merchantId,
    jurisdictionCode: input.policy.jurisdictionCode,
    hasKyc: input.hasKyc,
    policy: input.policy,
    rails: input.rails,
  });

  const funding = autoSelectFunding({
    wallet: input.wallet,
    price: input.price,
    compliance,
    rails: input.rails,
    rates: input.rates,
  });

  return {
    approved: funding.approved,
    reason: funding.reason,
    fundingChoices: funding.fundingChoices,
    selectedRail: funding.selectedRail?.railType,
    complianceSnapshot: compliance,
    settlementCurrency: input.price.settlementCurrency,
    settlementAmount: input.price.settlementAmount,
  };
}

export function createSettlementRecord(input: {
  walletId: string;
  ownerId: string;
  merchantId: string;
  jurisdictionCode: string;
  displayCurrency: string;
  displayAmount: number;
  realValueUnits: number;
  decision: WalletDecision;
}): SettlementRecord {
  if (!input.decision.approved || !input.decision.selectedRail) {
    throw new Error("Cannot create settlement record from an unapproved wallet decision.");
  }

  return {
    settlementId: `settlement-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    walletId: input.walletId,
    ownerId: input.ownerId,
    merchantId: input.merchantId,
    jurisdictionCode: input.jurisdictionCode,
    selectedRail: input.decision.selectedRail,
    settlementCurrency: input.decision.settlementCurrency,
    settlementAmount: input.decision.settlementAmount,
    displayCurrency: input.displayCurrency,
    displayAmount: input.displayAmount,
    realValueUnits: input.realValueUnits,
    fundingChoices: input.decision.fundingChoices,
    complianceSnapshot: input.decision.complianceSnapshot,
    status: "settled",
    occurredAt: new Date().toISOString(),
  };
}

export function executeWalletDecision(input: {
  wallet: EcosystemWalletProfile;
  price: RealValuePrice;
  policy: JurisdictionPolicy;
  rails: RailCapability[];
  rates: ValueConversionRate[];
  hasKyc: boolean;
}): {
  decision: WalletDecision;
  settlementRecord: SettlementRecord | null;
} {
  const decision = previewWalletDecision({
    wallet: input.wallet,
    price: input.price,
    policy: input.policy,
    rails: input.rails,
    rates: input.rates,
    hasKyc: input.hasKyc,
  });

  if (!decision.approved) {
    return {
      decision,
      settlementRecord: null,
    };
  }

  const settlementRecord = createSettlementRecord({
    walletId: input.wallet.walletId,
    ownerId: input.wallet.ownerId,
    merchantId: input.price.merchantId,
    jurisdictionCode: input.policy.jurisdictionCode,
    displayCurrency: input.price.displayCurrency,
    displayAmount: input.price.displayAmount,
    realValueUnits: input.price.realValueUnits,
    decision,
  });

  return {
    decision,
    settlementRecord,
  };
}

export function previewLockboxDecision(input: {
  wallet: EcosystemWalletProfile;
  policy: LockboxPolicy;
  presence: PresenceSnapshot;
}): LockboxDecision {
  return evaluateLockboxOpen(input);
}

export function previewLoyalty(input: {
  walletId: string;
  settlements: SettlementRecord[];
}) {
  return buildLoyaltySnapshot(input.walletId, input.settlements);
}