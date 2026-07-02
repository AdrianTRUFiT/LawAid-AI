export type ValueKind =
  | "fiat_balance"
  | "stable_value"
  | "merchant_credit"
  | "loyalty_value"
  | "service_credit"
  | "reserved_value";

export type RailType =
  | "internal_ledger"
  | "card_network"
  | "ach"
  | "stable_settlement"
  | "local_partner_network";

export type ComplianceStatus =
  | "compliant"
  | "review_required"
  | "restricted"
  | "refused";

export type SettlementStatus =
  | "prepared"
  | "authorized"
  | "settled"
  | "refused";

export type LockboxPresenceLevel =
  | "level-1"
  | "level-2"
  | "level-3"
  | "duress-aware";

export type LockboxState =
  | "sealed"
  | "open"
  | "escalated"
  | "compromised";

export type ProductSurface =
  | "PAI_SAFE_WALLET"
  | "TRUFIT_DIGITAL_LOCKBOX";

export interface ValueBalance {
  balanceId: string;
  valueKind: ValueKind;
  unitCode: string;
  amount: number;
  priority: number;
  jurisdictionScope?: string[];
  merchantScope?: string[];
  expiresAt?: string;
}

export interface EcosystemWalletProfile {
  walletId: string;
  ownerId: string;
  homeJurisdiction: string;
  trustTier: "starter" | "verified" | "trusted" | "institutional";
  balances: ValueBalance[];
}

export interface RealValuePrice {
  priceId: string;
  merchantId: string;
  realValueUnits: number;
  displayCurrency: string;
  displayAmount: number;
  settlementCurrency: string;
  settlementAmount: number;
  occurredAt: string;
}

export interface ValueConversionRate {
  unitCode: string;
  settlementCurrency: string;
  settlementPerUnit: number;
  displayCurrency: string;
  displayPerUnit: number;
}

export interface JurisdictionPolicy {
  jurisdictionCode: string;
  acceptedValueKinds: ValueKind[];
  allowedRails: RailType[];
  requiresKyc: boolean;
  minTrustTier?: EcosystemWalletProfile["trustTier"];
  blockedMerchantIds?: string[];
}

export interface RailCapability {
  railType: RailType;
  supportedSettlementCurrencies: string[];
  jurisdictions: string[];
  enabled: boolean;
  priority: number;
  settlementFinalityClass: "instant" | "batched" | "network_final";
}

export interface ComplianceSnapshot {
  jurisdictionCode: string;
  merchantId: string;
  trustTier: EcosystemWalletProfile["trustTier"];
  kycSatisfied: boolean;
  policySatisfied: boolean;
  acceptedValueKinds: ValueKind[];
  allowedRails: RailType[];
  status: ComplianceStatus;
  notes: string[];
  createdAt: string;
}

export interface FundingChoice {
  balanceId: string;
  valueKind: ValueKind;
  unitCode: string;
  unitsConsumed: number;
  settlementValueProvided: number;
}

export interface WalletDecision {
  approved: boolean;
  reason: string;
  fundingChoices: FundingChoice[];
  selectedRail?: RailType;
  complianceSnapshot: ComplianceSnapshot;
  settlementCurrency: string;
  settlementAmount: number;
}

export interface SettlementRecord {
  settlementId: string;
  walletId: string;
  ownerId: string;
  merchantId: string;
  jurisdictionCode: string;
  selectedRail: RailType;
  settlementCurrency: string;
  settlementAmount: number;
  displayCurrency: string;
  displayAmount: number;
  realValueUnits: number;
  fundingChoices: FundingChoice[];
  complianceSnapshot: ComplianceSnapshot;
  status: SettlementStatus;
  occurredAt: string;
}

export interface LoyaltySnapshot {
  walletId: string;
  settledTransactionCount: number;
  totalSettlementValue: number;
  earnedLoyaltyValue: number;
  trustScore: number;
}

export interface LockboxPolicy {
  policyId: string;
  presenceLevel: LockboxPresenceLevel;
  duressAware: boolean;
  requiredTrustTier?: EcosystemWalletProfile["trustTier"];
  protectedValueKinds: ValueKind[];
  allowDecoyResponse: boolean;
}

export interface PresenceSnapshot {
  ownerId: string;
  deviceBound: boolean;
  biometricSatisfied: boolean;
  behaviorScore: number;
  duressConfidence: number;
  journalingDeltaAccepted: boolean;
}

export interface LockboxDecision {
  approved: boolean;
  state: LockboxState;
  reason: string;
  escalationRequired: boolean;
  decoyRecommended: boolean;
}

export interface BrandedSurfaceManifest {
  surface: ProductSurface;
  displayName: string;
  coreCapability: string;
  usesWalletLayer: boolean;
  usesLockboxLayer: boolean;
  trustWrapped: boolean;
}
